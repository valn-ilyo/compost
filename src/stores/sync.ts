// ─── syncStore ────────────────────────────────────────────────────────────────
//
// QUEUE
// ─────
// Every store action that writes data calls enqueue(item). The item carries a
// dedup key, the operation type, and a payload. The queue is persisted to
// localStorage so it survives page refreshes while offline.
//
// Dedup: if the same id is enqueued twice, profiles use shallow merge (incoming
// fields win); all others are last-write-wins (newer item replaces the older).
//
// DRAIN
// ─────
// drain() flushes the queue to Supabase sequentially. Two operation paths:
//
//   'upsert' — ledger tables (habit_logs, freeze_ledger, mastered_archive).
//     ignoreDuplicates=true — conflict means row already on server, silent success.
//     Mutable tables (assessment_answers, profiles) use regular upsert.
//
//   'rpc' — SECURITY DEFINER slot lifecycle RPCs.
//     supabase.rpc(fn, payload). Three error categories:
//
//     slot_cap_exceeded (SQLSTATE P0001):
//       State mismatch — the optimistic local update diverged from server state.
//       Discard the item, call capRejectionCallback (which re-hydrates habit_slots
//       + habit_pause_events and runs reconcile). Continue draining.
//
//     401 / auth error:
//       Abort entire drain. Queue stays intact.
//
//     Network / 5xx:
//       Stop at this item. Everything after stays in order. Retry in 5 seconds.
//
// CAP REJECTION CALLBACK
// ──────────────────────
// capRejectionCallback is registered by App.vue via setCapRejectionCallback().
// It avoids a circular dependency — sync.ts cannot import mastery.ts (mastery.ts
// already imports sync.ts). App.vue wires the two stores together:
//
//   syncStore.setCapRejectionCallback(async () => {
//     await masteryStore.hydrateFromSupabase(masteryStore.userId)
//     masteryStore.reconcile()
//   })
//
// RECONNECT SEQUENCE
// ──────────────────
// Order is strict — do not deviate:
//   1. isSyncing = true   ← gates Realtime handlers
//   2. drain()            ← flush local writes first (local intent wins)
//   3. reconnectCallback  ← hydrate forceRemote + reconcile
//   4. isSyncing = false  ← Realtime resumes
//
// REALTIME SUBSCRIPTIONS (Phase 6D)
// ──────────────────────────────────
// habit_logs, freeze_ledger, mastered_archive — INSERT only (append-only).
// habit_slots         — INSERT + UPDATE + DELETE (mutable server state).
// habit_pause_events  — INSERT + UPDATE (windows open and close; never deleted).
//
// All handlers gate on isSyncing — events dropped during a drain/hydrate
// cycle are recovered by the hydrateFromSupabase() full-replace that follows.
// ─────────────────────────────────────────────────────────────────────────────

import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useOnline } from "@vueuse/core";
import type {
  SyncQueueItem,
  SyncStatus,
  HabitLog,
  FreezeLedgerRow,
  HabitSlot,
  HabitPauseEvent,
  MasteredEntry,
  RealtimeHandlers,
} from "@/types/app";
import type { PersistenceOptions } from "pinia-plugin-persistedstate";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";

// ─── Ledger tables — append-only, ignoreDuplicates on upsert ─────────────────

const LEDGER_TABLES = new Set(["habit_logs", "freeze_ledger", "mastered_archive"]);

// ─── ON_CONFLICT targets per mutable table ────────────────────────────────────

const ON_CONFLICT: Record<string, string> = {
  habit_logs: "user_id,template_id,date",
  freeze_ledger: "user_id,template_id,date,reason",
  mastered_archive: "user_id,template_id",
  assessment_answers: "user_id,section_id",
  profiles: "user_id",
};

export const useSyncStore = defineStore(
  "sync",
  () => {
    // ── State ────────────────────────────────────────────────────────────────

    const queue = ref<SyncQueueItem[]>([]);
    const isOnline = useOnline();
    const isHydrated = ref(false);
    const isHydrating = ref(false);

    // True during the reconnect flush+backfill window.
    // All Realtime handlers check this at entry and return early if true —
    // prevents incoming server rows from racing with drain/hydrate.
    const isSyncing = ref(false);

    // Registered by App.vue. Called after drain() in the reconnect sequence.
    let reconnectCallback: (() => Promise<void>) | null = null;

    function onReconnect(cb: () => Promise<void>): void {
      reconnectCallback = cb;
    }

    // Registered by App.vue after both stores are available.
    // Called when drain() encounters a slot_cap_exceeded error on an RPC item.
    // Signature: re-hydrate habit_slots + pause_events from server, then reconcile.
    // Not stored as a ref — it's a module-level closure that never needs to be reactive.
    let capRejectionCallback: (() => Promise<void>) | null = null;

    function setCapRejectionCallback(cb: () => Promise<void>): void {
      capRejectionCallback = cb;
    }

    // ── Computed ─────────────────────────────────────────────────────────────

    const status = computed<SyncStatus>(() => {
      if (!isOnline.value) return "offline";
      if (isHydrating.value) return "hydrating";
      if (queue.value.length > 0) return "syncing";
      return "synced";
    });

    // ── Drain ─────────────────────────────────────────────────────────────────

    let draining = false;

    /**
     * Flush the sync queue to Supabase sequentially.
     *
     * Items are processed one at a time in enqueue order. Two operation paths:
     *   'upsert' — supabase.from(table).upsert(payload, ...)
     *   'rpc'    — supabase.rpc(fn, payload)
     *
     * Returns when the queue is empty or an unrecoverable error stops processing.
     */
    async function drain(): Promise<void> {
      if (!isOnline.value || !isHydrated.value || queue.value.length === 0) return;
      if (draining) return;
      draining = true;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return; // no session — leave queue intact for after next login

        while (queue.value.length > 0) {
          const item = queue.value[0]!;

          // ── RPC path ───────────────────────────────────────────────────────
          if (item.operation === "rpc") {
            const { error, status } = await supabase.rpc(
              item.fn!,
              item.payload as Record<string, unknown>,
            );

            if (error) {
              // State mismatch: server rejected the action because the cap was
              // already full when the RPC ran. The optimistic local write is now
              // diverged. Discard this item and let the callback re-sync state.
              // Continue draining — subsequent items may still be valid.
              if (error.code === "P0001" && error.message?.includes("slot_cap_exceeded")) {
                queue.value.shift();
                capRejectionCallback?.();
                continue;
              }

              // Auth error: abort entire drain.
              if (status === 401) break;

              // Network or 5xx: stop here, preserve order, retry in 5s.
              setTimeout(() => drain(), 5000);
              break;
            }

            queue.value.shift();
            continue;
          }

          // ── Upsert path ────────────────────────────────────────────────────
          if (item.operation === "upsert") {
            const isLedger = LEDGER_TABLES.has(item.table!);
            const conflictTarget = ON_CONFLICT[item.table!];

            const { error, status } = await supabase
              .from(item.table!)
              .upsert(item.payload as Record<string, unknown>, {
                onConflict: conflictTarget,
                ignoreDuplicates: isLedger,
              });

            if (error) {
              if (status === 401) break;
              setTimeout(() => drain(), 5000);
              break;
            }

            queue.value.shift();
            continue;
          }

          // ── Delete path (not currently used) ──────────────────────────────
          if (item.operation === "delete") {
            const { error, status } = await supabase
              .from(item.table!)
              .delete()
              .match(item.payload as Record<string, unknown>);

            if (error) {
              if (status === 401) break;
              setTimeout(() => drain(), 5000);
              break;
            }

            queue.value.shift();
            continue;
          }

          // Unknown operation — discard to avoid infinite loop.
          queue.value.shift();
        }
      } finally {
        draining = false;
      }
    }

    // ── Queue management ──────────────────────────────────────────────────────

    /**
     * Add an item to the sync queue.
     *
     * Dedup by item.id:
     *   Not found          → append.
     *   Found, 'profiles'  → shallow merge payload (incoming fields win).
     *   Found, everything else → last-write-wins (replace entire item).
     *
     * RPC items: always last-write-wins (item.table is undefined so the
     * profiles merge branch never fires).
     *
     * No-op if isHydrated is false — writes before hydration are discarded
     * because we don't yet know what's already on the server.
     */
    function enqueue(item: SyncQueueItem): void {
      if (!isHydrated.value) return;

      const existingIndex = queue.value.findIndex((q) => q.id === item.id);

      if (existingIndex === -1) {
        queue.value.push(item);
      } else if (item.table === "profiles") {
        const existing = queue.value[existingIndex]!;
        queue.value[existingIndex] = {
          ...existing,
          payload: { ...existing.payload, ...item.payload },
          enqueuedAt: item.enqueuedAt,
        };
      } else {
        queue.value[existingIndex] = item;
      }

      if (isOnline.value) drain();
    }

    function dequeueByTable(table: string): void {
      queue.value = queue.value.filter((item) => item.table !== table);
    }

    function clearQueue(): void {
      queue.value = [];
    }

    // ── Hydration state ───────────────────────────────────────────────────────

    function beginHydrating(): void {
      isHydrating.value = true;
    }

    function endHydrating(): void {
      isHydrating.value = false;
    }

    function setHydrated(): void {
      isHydrating.value = false;
      isHydrated.value = true;
      if (isOnline.value && queue.value.length > 0) drain();
    }

    // ── Init — reconnect watcher ──────────────────────────────────────────────

    function init(): void {
      watch(isOnline, async (online) => {
        if (!online) return;
        if (!isHydrated.value) return;

        isSyncing.value = true;
        try {
          await drain();
          if (reconnectCallback) await reconnectCallback();
        } finally {
          isSyncing.value = false;
        }
      });

      // Cold start: persisted queue + already online+hydrated (fast cached session).
      if (isOnline.value && isHydrated.value && queue.value.length > 0) drain();
    }

    // ── Realtime channel management ───────────────────────────────────────────
    //
    // startRealtime() is called by App.vue once, when isHydrated becomes true.
    // stopRealtime() is called when isHydrated drops back to false (logout).
    // Calling startRealtime() a second time safely tears down previous channels.
    //
    // Subscriptions:
    //   habit_logs, freeze_ledger, mastered_archive — INSERT only (append-only)
    //   habit_slots         — INSERT + UPDATE + DELETE (mutable server state)
    //   habit_pause_events  — INSERT + UPDATE (windows open and close)
    //
    // DELETE events carry the row in payload.old (payload.new is empty).
    // INSERT and UPDATE events carry the new row in payload.new.

    let channels: RealtimeChannel[] = [];

    // ── Generic INSERT-only subscription helper ───────────────────────────────
    //
    // Captures each row type T individually so the handler stays properly typed.
    // Using a shared array with a homogeneous handler type would require
    // (row: Record<string, unknown>) => void, which TypeScript correctly rejects
    // because function parameters are contravariant — a handler that expects a
    // HabitLog cannot safely accept an arbitrary Record<string, unknown>.
    //
    // The `as unknown as T` cast is intentional: Supabase Realtime's postgres_changes
    // payload is typed as Record<string, unknown> at the library level, but the
    // actual runtime value always matches the DB row shape for INSERT events.

    function subscribeInsert<T>(table: string, handler: (row: T) => void): RealtimeChannel {
      return supabase
        .channel(`realtime:${table}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table }, (payload) => {
          if (isSyncing.value) return;
          handler(payload.new as unknown as T);
        })
        .subscribe();
    }

    function startRealtime(handlers: RealtimeHandlers): void {
      stopRealtime();

      // ── Append-only tables — INSERT only ───────────────────────────────────

      channels.push(subscribeInsert<HabitLog>("habit_logs", handlers.onHabitLog));
      channels.push(subscribeInsert<FreezeLedgerRow>("freeze_ledger", handlers.onFreezeRow));
      channels.push(subscribeInsert<MasteredEntry>("mastered_archive", handlers.onMasteredEntry));

      // ── habit_slots — INSERT + UPDATE + DELETE ─────────────────────────────

      const slotsChannel = supabase
        .channel("realtime:habit_slots")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "habit_slots" },
          (payload) => {
            if (isSyncing.value) return;
            handlers.onHabitSlot(payload.new as unknown as HabitSlot, "INSERT");
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "habit_slots" },
          (payload) => {
            if (isSyncing.value) return;
            handlers.onHabitSlot(payload.new as unknown as HabitSlot, "UPDATE");
          },
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "habit_slots" },
          (payload) => {
            if (isSyncing.value) return;
            // DELETE carries the deleted row in payload.old.
            handlers.onHabitSlot(payload.old as unknown as HabitSlot, "DELETE");
          },
        )
        .subscribe();
      channels.push(slotsChannel);

      // ── habit_pause_events — INSERT + UPDATE ───────────────────────────────

      const pauseChannel = supabase
        .channel("realtime:habit_pause_events")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "habit_pause_events" },
          (payload) => {
            if (isSyncing.value) return;
            handlers.onPauseEvent(payload.new as unknown as HabitPauseEvent, "INSERT");
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "habit_pause_events" },
          (payload) => {
            if (isSyncing.value) return;
            handlers.onPauseEvent(payload.new as unknown as HabitPauseEvent, "UPDATE");
          },
        )
        .subscribe();
      channels.push(pauseChannel);
    }

    function stopRealtime(): void {
      for (const channel of channels) supabase.removeChannel(channel);
      channels = [];
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
      setCapRejectionCallback,
      beginHydrating,
      endHydrating,
      enqueue,
      dequeueByTable,
      clearQueue,
      setHydrated,
      drain,
      startRealtime,
      stopRealtime,
    };
  },
  {
    persist: {
      key: "sync-store",
      storage: localStorage,
      pick: ["queue"],
    } as PersistenceOptions,
  },
);
