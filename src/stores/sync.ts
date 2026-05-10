import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useOnline } from "@vueuse/core";
import type { SyncQueueItem, SyncStatus } from "@/types/app.types";
import type { PersistenceOptions } from "pinia-plugin-persistedstate";
import { supabase } from "@/lib/supabaseClient";

// ─── onConflict targets per table ────────────────────────────────────────────

const ON_CONFLICT: Record<string, string> = {
  profiles: "user_id",
  assessment_answers: "user_id,section_id",
  habit_slots: "user_id,template_id",
  mastery_state: "user_id",
  mastered_archive: "user_id,template_id",
};

export const useSyncStore = defineStore(
  "sync",
  () => {
    // ─── State ──────────────────────────────────────────────────────────────

    /** Pending writes to Supabase. Persisted so the queue survives page refreshes. */
    const queue = ref<SyncQueueItem[]>([]);

    /** Reactive online status via VueUse — no manual init or window listeners needed. */
    const isOnline = useOnline();

    /**
     * True once hydration has completed (or been confirmed unnecessary).
     * No writes go to Supabase until this is set. Not persisted.
     */
    const isHydrated = ref(false);

    /**
     * True while a Supabase hydration pull is in flight.
     * Set by beginHydrating(); cleared by setHydrated() or endHydrating().
     * Not persisted.
     */
    const isHydrating = ref(false);

    /**
     * Optional async callback registered by App.vue.
     * Called when the device comes back online, before the queue is drained.
     * This is where the caller re-hydrates all stores from Supabase so that
     * the drain pushes state that already reflects what other devices wrote.
     */
    let reconnectCallback: (() => Promise<void>) | null = null;

    function onReconnect(cb: () => Promise<void>) {
      reconnectCallback = cb;
    }

    // ─── Computed ────────────────────────────────────────────────────────────

    const status = computed<SyncStatus>(() => {
      if (!isOnline.value) return "offline";
      if (isHydrating.value) return "hydrating";
      if (queue.value.length > 0) return "syncing";
      return "synced";
    });

    // ─── Actions ─────────────────────────────────────────────────────────────

    /**
     * Call once from App.vue onMounted.
     * Wires the reconnect/drain logic to the reactive isOnline ref and
     * performs an initial drain if already online and hydrated.
     */
    function init() {
      // isOnline is already reactive via useOnline — no window listeners needed.
      // Move the reconnect + drain logic into a watcher so it fires whenever
      // the device comes back online.
      watch(isOnline, async (online) => {
        if (!online) return;
        if (!isHydrated.value) return;

        // Re-pull from Supabase before draining so the queue reflects what
        // other devices wrote while this one was offline. Without this step,
        // the drain would push a stale snapshot and potentially overwrite
        // progress made on another device (even with the DB-side merge guards).
        if (reconnectCallback) {
          try {
            await reconnectCallback();
          } catch {
            // Hydration failed (network still flaky, session expired, etc.).
            // Leave the queue intact — the next online event will retry.
            return;
          }
        }

        if (queue.value.length > 0) {
          drain();
        }
      });

      if (isOnline.value && isHydrated.value && queue.value.length > 0) {
        drain();
      }
    }

    /**
     * Add or merge an item into the queue by dedup id.
     * - profiles: shallow-merges payload into the existing entry
     * - all other tables: last write wins (new payload replaces old)
     * No-ops silently if isHydrated is false.
     */
    function enqueue(item: SyncQueueItem) {
      if (!isHydrated.value) return;

      const existingIndex = queue.value.findIndex((q) => q.id === item.id);

      if (existingIndex === -1) {
        queue.value.push(item);
      } else if (item.table === "profiles") {
        // Shallow merge: incoming fields win over existing, other fields are preserved.
        const existing = queue.value[existingIndex]!;
        queue.value[existingIndex] = {
          id: existing.id,
          table: existing.table,
          operation: existing.operation,
          payload: { ...existing.payload, ...item.payload },
          enqueuedAt: item.enqueuedAt,
        };
      } else {
        // Last write wins.
        queue.value[existingIndex] = item;
      }

      // Kick off a drain immediately — don't wait for the next online event or page refresh.
      if (isOnline.value) {
        drain();
      }
    }

    /**
     * Remove all queue entries for a given table.
     * Called when local data for a table is wiped (e.g. assessment clearAll).
     */
    function dequeueByTable(table: string) {
      queue.value = queue.value.filter((item) => item.table !== table);
    }

    /** Wipe the entire queue. Called on logout. */
    function clearQueue() {
      queue.value = [];
    }

    /** Signal that a Supabase pull is starting. */
    function beginHydrating() {
      isHydrating.value = true;
    }

    /** Signal that a reconnect hydration pull finished (without calling setHydrated). */
    function endHydrating() {
      isHydrating.value = false;
    }

    /**
     * Mark hydration as complete. Triggers a drain if online and queue is non-empty.
     */
    function setHydrated() {
      isHydrating.value = false;
      isHydrated.value = true;
      if (isOnline.value && queue.value.length > 0) {
        drain();
      }
    }

    // Concurrency guard: prevents two simultaneous drain() calls (e.g. from
    // setHydrated() and the online event handler firing together on reconnect)
    // from racing over the same queue items.
    let draining = false;

    /**
     * Flush the queue to Supabase sequentially.
     *
     * - Checks for a valid session before starting; bails (without clearing)
     *   if there is none.
     * - Processes items one at a time — order matters for delete+upsert pairs
     *   on the same PK (e.g. swapHabit).
     * - Successful items are spliced from the queue immediately.
     * - On 401 / auth error: aborts the entire drain, leaves remaining items.
     * - On network or 5xx error: stops at that item, leaves it and all
     *   subsequent items for the next drain call.
     */
    async function drain() {
      if (!isOnline.value || !isHydrated.value || queue.value.length === 0) return;
      if (draining) return;
      draining = true;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabase as any;

        // Always process queue[0]: on success it is spliced out so the next
        // item shifts into position; on any failure we return immediately,
        // leaving the item (and everything behind it) for the next drain call.
        while (queue.value.length > 0) {
          const item = queue.value[0]!;

          try {
            if (item.operation === "upsert") {
              const onConflict = ON_CONFLICT[item.table];
              const { error } = await db
                .from(item.table)
                .upsert(item.payload, onConflict ? { onConflict } : undefined);

              if (error) {
                console.warn(
                  `[sync] upsert failed on table="${item.table}" id="${item.id}"`,
                  error,
                );
                // 401 / JWT expired — abort the whole drain
                if (error.status === 401 || error.code === "PGRST301") return;
                // 23505 unique_violation — retrying will never succeed; drop the
                // item so the queue doesn't stall. This is a last-resort guard;
                // the frontend uniqueness check (is_roll_no_available RPC) should
                // have caught this before the item was enqueued.
                if (error.code === "23505") {
                  console.error(
                    `[sync] dropping unresolvable conflict on table="${item.table}" id="${item.id}"`,
                    error,
                  );
                  queue.value.splice(0, 1);
                  continue;
                }
                // Network / 5xx — stop here and schedule a retry so the queue
                // doesn't stall indefinitely if the device never goes offline.
                setTimeout(() => {
                  if (isOnline.value) drain();
                }, 5_000);
                return;
              }
            } else {
              // delete — payload contains only PK fields
              const { error } = await db.from(item.table).delete().match(item.payload);

              if (error) {
                console.warn(
                  `[sync] delete failed on table="${item.table}" id="${item.id}"`,
                  error,
                );
                if (error.status === 401 || error.code === "PGRST301") return;
                setTimeout(() => {
                  if (isOnline.value) drain();
                }, 5_000);
                return;
              }
            }
            queue.value.splice(0, 1);
          } catch (err) {
            console.warn(`[sync] network error on table="${item.table}" id="${item.id}"`, err);
            // Network error (fetch threw) — stop draining and schedule a retry
            // so the queue doesn't stall if the device never goes offline.
            setTimeout(() => {
              if (isOnline.value) drain();
            }, 5_000);
            return;
          }
        }
      } finally {
        draining = false;
      }
    }

    return {
      queue,
      isOnline,
      isHydrated,
      isHydrating,
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
    };
  },
  {
    persist: {
      key: "sync-store",
      storage: localStorage,
      // Only queue survives page refresh; isOnline, isHydrated, and isHydrating are runtime state.
      pick: ["queue"],
    } as PersistenceOptions,
  },
);
