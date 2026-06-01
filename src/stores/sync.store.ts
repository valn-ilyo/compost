// Pinia store -- sync queue, drain loop, Realtime subscriptions, and reconnect orchestration
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
//   'upsert' -- ledger tables (habit_logs, freeze_ledger, mastered_archive).
//     ignoreDuplicates=true -- conflict means row already on server, silent success.
//     Mutable tables (assessment_answers, profiles) use regular upsert.
//
//   'rpc' -- SECURITY DEFINER slot lifecycle RPCs.
//     supabase.rpc(fn, payload). Three error categories:
//
//     slot_cap_exceeded (SQLSTATE P0001):
//       State mismatch -- the optimistic local update diverged from server state.
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
// It avoids a circular dependency -- sync.ts cannot import mastery.ts (mastery.ts
// already imports sync.ts). App.vue wires the two stores together:
//
//   syncStore.setCapRejectionCallback(async () => {
//     await masteryStore.hydrateFromSupabase(masteryStore.userId)
//     masteryStore.reconcile()
//   })
//
// RECONNECT SEQUENCE
// ──────────────────
// Order is strict -- do not deviate:
//   1. isSyncing = true   <- gates Realtime handlers
//   2. drain()            <- flush local writes first (local intent wins)
//   3. reconnectCallback  <- hydrate forceRemote + reconcile
//   4. isSyncing = false  <- Realtime resumes
//
// REALTIME SUBSCRIPTIONS
// ──────────────────────
// habit_logs, freeze_ledger, mastered_archive -- INSERT only (append-only).
// habit_slots         -- INSERT + UPDATE + DELETE (mutable server state).
// habit_pause_events  -- INSERT + UPDATE (windows open and close; never deleted).
//
// All handlers gate on isSyncing -- events dropped during a drain/hydrate
// cycle are recovered by the hydrateFromSupabase() full-replace that follows.

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
} from "@/types/app.types";
import type { PersistenceOptions } from "pinia-plugin-persistedstate";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase.service";

// Append-only tables use ignoreDuplicates=true on upsert -- conflict means the
// row already landed on the server via another device or a prior drain.
const LEDGER_TABLES = new Set(["habit_logs", "freeze_ledger", "mastered_archive"]);

// Unique conflict targets per table -- required by Supabase upsert.
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
    // ─── State ───────────────────────────────────────────────────────────────

    const queue = ref<SyncQueueItem[]>([]);
    const isOnline = useOnline();
    const isHydrated = ref(false);
    const isHydrating = ref(false);

    // True during the reconnect flush+backfill window.
    // All Realtime handlers check this at entry and return early if true --
    // prevents incoming server rows from racing with drain/hydrate.
    const isSyncing = ref(false);

    // Registered by App.vue. Called after drain() in the reconnect sequence.
    let reconnectCallback: (() => Promise<void>) | null = null;

    function onReconnect(cb: () => Promise<void>): void {
      reconnectCallback = cb;
    }

    // Registered by App.vue after both stores are available.
    // Called when drain() encounters a slot_cap_exceeded error on an RPC item.
    // Not stored as a ref -- it's a module-level closure that never needs to be reactive.
    let capRejectionCallback: (() => Promise<void>) | null = null;

    function setCapRejectionCallback(cb: () => Promise<void>): void {
      capRejectionCallback = cb;
    }

    // ─── Computed ────────────────────────────────────────────────────────────

    const status = computed<SyncStatus>(() => {
      if (!isOnline.value) return "offline";
      if (isHydrating.value) return "hydrating";
      if (queue.value.length > 0) return "syncing";
      return "synced";
    });

    // ─── Actions ─────────────────────────────────────────────────────────────

    let draining = false;

    // Flush the sync queue to Supabase sequentially.
    // Items are processed one at a time in enqueue order.
    // Returns when the queue is empty or an unrecoverable error stops processing.
    async function drain(): Promise<void> {
      if (!isOnline.value || !isHydrated.value || queue.value.length === 0) return;
      if (draining) return;
      draining = true;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return; // no session -- leave queue intact for after next login

        while (queue.value.length > 0) {
          const item = queue.value[0]!;

          if (item.operation === "rpc") {
            const { error, status } = await supabase.rpc(
              item.fn!,
              item.payload as Record<string, unknown>,
            );

            if (error) {
              // State mismatch: server rejected because the cap was already full.
              // The optimistic local write is now diverged. Discard and re-sync.
              if (error.code === "P0001" && error.message?.includes("slot_cap_exceeded")) {
                queue.value.shift();
                capRejectionCallback?.();
                continue;
              }

              if (status === 401) break; // auth error -- abort entire drain

              // Network or 5xx -- stop here, preserve order, retry in 5s.
              setTimeout(() => drain(), 5000);
              break;
            }

            queue.value.shift();
            continue;
          }

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

          queue.value.shift(); // unknown operation -- discard to avoid infinite loop
        }
      } finally {
        draining = false;
      }
    }

    // Dedup by item.id:
    //   Not found          -> append.
    //   Found, 'profiles'  -> shallow merge payload (incoming fields win).
    //   Found, everything else -> last-write-wins (replace entire item).
    //
    // RPC items are always last-write-wins (item.table is undefined so the
    // profiles merge branch never fires).
    //
    // No-op if isHydrated is false -- writes before hydration are discarded
    // because we don't yet know what's already on the server.
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

    // ─── Lifecycle ───────────────────────────────────────────────────────────

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

    // ─── Helpers ─────────────────────────────────────────────────────────────
    //
    // startRealtime() is called by App.vue once, when isHydrated becomes true.
    // stopRealtime() is called when isHydrated drops back to false (logout).
    // Calling startRealtime() a second time safely tears down previous channels.
    //
    // DELETE events carry the row in payload.old (payload.new is empty).
    // INSERT and UPDATE events carry the new row in payload.new.

    let channels: RealtimeChannel[] = [];

    // Supabase Realtime types postgres_changes payload as Record<string, unknown>
    // at the library level, but INSERT events always carry the full DB row shape.
    // The `as unknown as T` cast is intentional -- function parameters are
    // contravariant, so a typed handler cannot safely accept Record<string, unknown>
    // without this intermediate cast.
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

      channels.push(subscribeInsert<HabitLog>("habit_logs", handlers.onHabitLog));
      channels.push(subscribeInsert<FreezeLedgerRow>("freeze_ledger", handlers.onFreezeRow));
      channels.push(subscribeInsert<MasteredEntry>("mastered_archive", handlers.onMasteredEntry));

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
