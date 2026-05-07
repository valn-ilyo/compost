import { defineStore } from "pinia";
import { ref, computed } from "vue";
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

    /** Derived from navigator.onLine on init; updated via window events. Not persisted. */
    const isOnline = ref(false);

    /**
     * True once hydration has completed (or been confirmed unnecessary).
     * No writes go to Supabase until this is set. Not persisted.
     */
    const isHydrated = ref(false);

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
      if (queue.value.length > 0) return "syncing";
      return "synced";
    });

    // ─── Actions ─────────────────────────────────────────────────────────────

    /**
     * Call once from App.vue onMounted.
     * Sets isOnline, attaches online/offline listeners, drains if ready.
     */
    function init() {
      isOnline.value = navigator.onLine;

      window.addEventListener("online", async () => {
        isOnline.value = true;
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

      window.addEventListener("offline", () => {
        isOnline.value = false;
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

    /**
     * Mark hydration as complete. Triggers a drain if online and queue is non-empty.
     */
    function setHydrated() {
      isHydrated.value = true;
      if (isOnline.value && queue.value.length > 0) {
        drain();
      }
    }

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

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return; // no valid session — leave queue intact for after next sign-in

      // Cast to any: table names are dynamic strings validated by ON_CONFLICT map above.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;

      const totalStart = performance.now();
      const totalItems = queue.value.length;
      console.log(`[sync] drain started — ${totalItems} item(s) in queue`);

      const i = 0;
      while (i < queue.value.length) {
        const item = queue.value[i]!;
        const itemStart = performance.now();

        try {
          if (item.operation === "upsert") {
            const onConflict = ON_CONFLICT[item.table];
            const { error } = await db
              .from(item.table)
              .upsert(item.payload, onConflict ? { onConflict } : undefined);

            if (error) {
              console.warn(`[sync] upsert failed on table="${item.table}" id="${item.id}"`, error);
              // 401 / JWT expired — abort the whole drain
              if (error.status === 401 || error.code === "PGRST301") return;
              // Network / 5xx — stop here, retry on next online event
              return;
            }
          } else {
            // delete — payload contains only PK fields
            const { error } = await db.from(item.table).delete().match(item.payload);

            if (error) {
              console.warn(`[sync] delete failed on table="${item.table}" id="${item.id}"`, error);
              if (error.status === 401 || error.code === "PGRST301") return;
              return;
            }
          }

          const itemMs = (performance.now() - itemStart).toFixed(1);
          console.log(
            `[sync] ✓ ${item.operation} table="${item.table}" id="${item.id}" — ${itemMs}ms`,
          );

          // Success — remove from queue without advancing i (array shifted left)
          queue.value.splice(i, 1);
        } catch (err) {
          console.warn(`[sync] network error on table="${item.table}" id="${item.id}"`, err);
          // Network error (fetch threw) — stop draining, retry on next online event
          return;
        }
      }

      const totalMs = (performance.now() - totalStart).toFixed(1);
      console.log(`[sync] drain complete — ${totalItems} item(s) in ${totalMs}ms`);
    }

    return {
      queue,
      isOnline,
      isHydrated,
      status,
      init,
      onReconnect,
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
      // Only queue survives page refresh; isOnline and isHydrated are runtime state.
      paths: ["queue"],
    } as PersistenceOptions,
  },
);
