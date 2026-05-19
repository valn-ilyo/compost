// ─── syncStore ────────────────────────────────────────────────────────────────
// Manages the offline queue and the reconnect sequence.
//
// QUEUE
// ─────
// Every store action that writes data calls enqueue(item). The item carries a
// dedup key (table:pk1:pk2...), the table name, operation, and payload. The
// queue is persisted to localStorage so it survives page refreshes while offline.
//
// Dedup: if the same id is enqueued twice, profiles use shallow merge; all others
// are last-write-wins (the newer item replaces the older one). This prevents the
// queue from growing unboundedly when the user edits the same thing repeatedly.
//
// DRAIN
// ─────
// drain() flushes the queue to Supabase using upsert for all tables.
// Ledger tables (habit_logs, freeze_ledger, slot_events, mastered_archive) use
// ignoreDuplicates=true — a conflict means the row already exists on the server,
// which is the desired idempotent outcome.
// Mutable tables (habit_slots, assessment_answers, profiles) use regular upsert
// so retakes and profile edits overwrite cleanly.
//
// Error handling:
//   - 401 / auth error: abort entire drain, leave queue intact.
//   - Network or 5xx: stop at that item, schedule 5s retry, preserve order.
//   - Conflict on ledger insert (handled by ignoreDuplicates): silent success.
//
// RECONNECT SEQUENCE
// ──────────────────
// Order is strict — do not deviate:
//   1. isSyncing = true   ← gates Phase 5 Realtime handlers
//   2. drain()            ← flush local writes FIRST (local intent wins)
//   3. reconnectCallback  ← hydrate all tables with forceRemote=true + reconcile
//   4. isSyncing = false  ← Realtime resumes
//
// Drain before hydrate is the critical invariant. Your local queue represents
// intent — things you did offline. Hydrating first would let server state
// overwrite your local writes before they're committed.
// ─────────────────────────────────────────────────────────────────────────────

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useOnline } from '@vueuse/core'
import type { SyncQueueItem, SyncStatus } from '@/types/app'
import type { PersistenceOptions } from 'pinia-plugin-persistedstate'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'

// ─── ON_CONFLICT targets per table ───────────────────────────────────────────
//
// Ledger tables: append-only, ignoreDuplicates=true — conflict = row already
// on server = silent success, no data lost.
// Mutable tables: conflict = update (upsert semantics).

const LEDGER_TABLES = new Set([
  'habit_logs',
  'freeze_ledger',
  'slot_events',
  'mastered_archive',
])

const ON_CONFLICT: Record<string, string> = {
  habit_logs:         'user_id,template_id,date',
  freeze_ledger:      'user_id,template_id,date,reason',
  slot_events:        'user_id,template_id,created_at',
  mastered_archive:   'user_id,template_id',
  habit_slots:        'user_id,template_id',
  assessment_answers: 'user_id,section_id',
  profiles:           'user_id',
}

// ─── Realtime handler contract ────────────────────────────────────────────────
//
// startRealtime() accepts this shape from App.vue. App.vue is the only place
// that imports both sync.ts and mastery.ts, so passing handlers as callbacks
// avoids a circular dependency (mastery.ts already imports sync.ts).

interface RealtimeHandlers {
  onHabitLog:      (row: Record<string, unknown>) => void
  onFreezeRow:     (row: Record<string, unknown>) => void
  onSlotEvent:     (row: Record<string, unknown>) => void
  onMasteredEntry: (row: Record<string, unknown>) => void
}

export const useSyncStore = defineStore(
  'sync',
  () => {
    // ── State ────────────────────────────────────────────────────────────────

    // Pending writes to Supabase. Persisted so the queue survives page refreshes.
    const queue = ref<SyncQueueItem[]>([])

    // Reactive online status via VueUse
    const isOnline = useOnline()

    // True once hydration has completed. No writes go to Supabase until set.
    // Not persisted — always false on fresh page load until runHydration completes.
    const isHydrated = ref(false)

    // True while a Supabase hydration pull is in flight. Not persisted.
    const isHydrating = ref(false)

    // True during the reconnect flush+backfill window.
    // All four Phase 5 Realtime handlers check isSyncing at entry and early-return
    // if true — prevents incoming server rows from interfering with drain/hydrate.
    const isSyncing = ref(false)

    // Callback registered by App.vue. Called during the reconnect sequence,
    // after drain() completes. Handles re-hydration with forceRemote=true
    // and runs reconcile() after hydration.
    let reconnectCallback: (() => Promise<void>) | null = null

    function onReconnect(cb: () => Promise<void>) {
      reconnectCallback = cb
    }

    // ── Computed ─────────────────────────────────────────────────────────────

    const status = computed<SyncStatus>(() => {
      if (!isOnline.value) return 'offline'
      if (isHydrating.value) return 'hydrating'
      if (queue.value.length > 0) return 'syncing'
      return 'synced'
    })

    // ── Drain ─────────────────────────────────────────────────────────────────

    // Mutex: prevents concurrent drain() calls from racing each other.
    let draining = false

    /**
     * Flush the sync queue to Supabase sequentially.
     *
     * Items are processed one at a time. Order matters — a slot_events 'added'
     * row must reach the server before the habit_logs rows for that template.
     *
     * Returns when the queue is empty or an unrecoverable error stops processing.
     */
    async function drain(): Promise<void> {
      if (!isOnline.value || !isHydrated.value || queue.value.length === 0) return
      if (draining) return
      draining = true

      try {
        // Verify session before starting — no point draining without auth.
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          // No session — leave queue intact for after next login.
          return
        }

        while (queue.value.length > 0) {
          const item = queue.value[0]!
          const isLedger = LEDGER_TABLES.has(item.table)
          const conflictTarget = ON_CONFLICT[item.table]

          const { error } = await supabase
            .from(item.table)
            .upsert(item.payload as Record<string, unknown>, {
              onConflict: conflictTarget,
              // Ledger tables: conflict = row already on server → do nothing (idempotent).
              // Mutable tables: conflict = update with incoming values.
              ignoreDuplicates: isLedger,
            })

          if (error) {
            if (error.status === 401) {
              // Auth error — abort entire drain. Queue stays intact.
              // The user will need to re-authenticate before the next drain.
              break
            }
            // Network error or 5xx — stop at this item. Everything after
            // it stays in the queue in order. Retry in 5 seconds.
            setTimeout(() => drain(), 5000)
            break
          }

          // Success — remove from front of queue.
          queue.value.shift()
        }
      } finally {
        draining = false
      }
    }

    // ── Queue management ──────────────────────────────────────────────────────

    /**
     * Add an item to the sync queue.
     *
     * Dedup by item.id:
     *   - Not found → append.
     *   - Found, table is 'profiles' → shallow merge payload (incoming fields win).
     *   - Found, any other table → last-write-wins (replace entire item).
     *
     * No-op if isHydrated is false — writes before hydration are discarded
     * because we don't yet know what's already on the server.
     */
    function enqueue(item: SyncQueueItem) {
      if (!isHydrated.value) return

      const existingIndex = queue.value.findIndex((q) => q.id === item.id)

      if (existingIndex === -1) {
        queue.value.push(item)
      } else if (item.table === 'profiles') {
        const existing = queue.value[existingIndex]!
        queue.value[existingIndex] = {
          id: existing.id,
          table: existing.table,
          operation: existing.operation,
          payload: { ...existing.payload, ...item.payload },
          enqueuedAt: item.enqueuedAt,
        }
      } else {
        queue.value[existingIndex] = item
      }

      if (isOnline.value) {
        drain()
      }
    }

    /** Remove all queue entries for a given table. */
    function dequeueByTable(table: string) {
      queue.value = queue.value.filter((item) => item.table !== table)
    }

    function clearQueue() {
      queue.value = []
    }

    // ── Hydration state ───────────────────────────────────────────────────────

    function beginHydrating() {
      isHydrating.value = true
    }

    function endHydrating() {
      isHydrating.value = false
    }

    /**
     * Mark hydration complete. Called by AuthView after all stores have pulled
     * their data from Supabase. Triggers an immediate drain if online and the
     * queue has items (e.g. writes made during the hydration window).
     */
    function setHydrated() {
      isHydrating.value = false
      isHydrated.value = true
      if (isOnline.value && queue.value.length > 0) {
        drain()
      }
    }

    // ── Init — reconnect watcher ──────────────────────────────────────────────

    /**
     * Attach the online/offline watcher. Call once from App.vue after
     * onReconnect() has been registered.
     *
     * Reconnect sequence (strict order):
     *   1. isSyncing = true   — gate Phase 5 Realtime handlers
     *   2. await drain()      — flush local writes before looking at server state
     *   3. reconnectCallback  — hydrate forceRemote + reconcile
     *   4. isSyncing = false  — Realtime resumes
     *
     * The cold-start drain (bottom of function) handles items already in the
     * persisted queue when the app loads while online and hydrated.
     */
    function init() {
      watch(isOnline, async (online) => {
        if (!online) return
        if (!isHydrated.value) return

        isSyncing.value = true
        try {
          await drain()
          if (reconnectCallback) {
            await reconnectCallback()
          }
        } finally {
          isSyncing.value = false
        }
      })

      // Cold start: if we're already online+hydrated (cached session fast path)
      // and the queue has persisted items, drain immediately.
      if (isOnline.value && isHydrated.value && queue.value.length > 0) {
        drain()
      }
    }

    // ── Realtime channel management ───────────────────────────────────────────
    //
    // One RealtimeChannel per ledger table — INSERT only.
    // All four handlers check isSyncing at entry and return immediately if true,
    // so no Realtime rows land while a drain()+hydrate cycle is in progress.
    //
    // startRealtime() is called by App.vue once, when isHydrated becomes true.
    // stopRealtime() is called when isHydrated drops back to false (logout).
    // Calling startRealtime() a second time safely tears down the previous
    // channels first, so no double-subscription can occur.

    let channels: RealtimeChannel[] = []

    function startRealtime(handlers: RealtimeHandlers): void {
      stopRealtime()

      const tableHandlers: Array<{
        table: string
        handler: (row: Record<string, unknown>) => void
      }> = [
        { table: 'habit_logs',       handler: handlers.onHabitLog },
        { table: 'freeze_ledger',    handler: handlers.onFreezeRow },
        { table: 'slot_events',      handler: handlers.onSlotEvent },
        { table: 'mastered_archive', handler: handlers.onMasteredEntry },
      ]

      for (const { table, handler } of tableHandlers) {
        const channel = supabase
          .channel(`realtime:${table}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table },
            (payload) => {
              // Gate: drop the event if a drain/hydrate cycle is in progress.
              // The reconnect sequence will pull the row via hydrateFromSupabase().
              if (isSyncing.value) return
              handler(payload.new as Record<string, unknown>)
            },
          )
          .subscribe()
        channels.push(channel)
      }
    }

    function stopRealtime(): void {
      for (const channel of channels) {
        supabase.removeChannel(channel)
      }
      channels = []
    }

    return {
      queue,
      isOnline,
      isHydrated,
      isHydrating,
      isSyncing,
      status,
      init,
      onReconnect,
      beginHydrating,
      endHydrating,
      enqueue,
      dequeueByTable,
      clearQueue,
      setHydrated,
      drain,
      startRealtime,
      stopRealtime,
    }
  },
  {
    persist: {
      key: 'sync-store',
      storage: localStorage,
      pick: ['queue'],
    } as PersistenceOptions,
  },
)
