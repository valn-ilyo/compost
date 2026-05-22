// ═══════════════════════════════════════════════════════════════════════════════
// masteryStore — local driver for the habit ledger system
// ═══════════════════════════════════════════════════════════════════════════════
//
// ARCHITECTURE
// ────────────
// Five ref arrays are the local database for all habit state.
//
//   habitLogs       ←→  habit_logs         (one row per logged day per habit)
//   freezeLedger    ←→  freeze_ledger      (one row per freeze token event)
//   habitSlots      ←→  habit_slots        (one row per active or paused habit)
//   pauseEvents     ←→  habit_pause_events (one row per pause window)
//   masteredArchive ←→  mastered_archive   (one row per retired habit)
//
// Every UI value — streak counts, freeze balances, active habit lists, mastery
// status — is derived from these arrays at runtime. Nothing is cached or stored
// twice.
//
// WRITE OWNERSHIP
// ───────────────
// habit_logs      — CLIENT ONLY via direct upsert (Sync).
// freeze_ledger   — CLIENT writes milestone/mastery rows via direct upsert.
//                   CRON writes spent rows; these never conflict with client rows.
// mastered_archive — CLIENT ONLY via direct upsert (Sync).
//
// habit_slots + habit_pause_events — SECURITY DEFINER RPCs ONLY.
//   slot_add    — INSERT new slot as 'active' (cap-gated by enforce_slot_cap trigger)
//   slot_pause  — active → paused + open pause window
//   slot_resume — paused → active (cap-gated) + close pause window
//   slot_remove — close open window + DELETE slot row
//   slot_retire — close open window + DELETE slot row + INSERT mastered_archive
//
//   Client RLS on these two tables is SELECT-only (R1). The RPC items in the
//   sync queue (operation: 'rpc') are drained by sync.ts which calls supabase.rpc().
//
// SLOT CAP
// ────────
// Maximum 3 ACTIVE slots simultaneously (MAX_SLOTS). Paused slots do not count.
// The enforce_slot_cap trigger on habit_slots enforces this server-side.
// usedSlots counts active only — the client uses this to gate the add flow.
//
// PAUSE / RESUME SEMANTICS
// ────────────────────────
// Pausing holds the slot and preserves the streak. The streak walker reads
// habit_pause_events to skip dates where the habit was paused (R14: only windows
// whose paused_at >= slot.created_at are considered — prior-cycle windows are ignored).
//
// SWAP SEMANTICS (R15)
// ────────────────────
// swapHabit pauses the outgoing habit when it has a streak > 0, and removes it
// when streak === 0. This preserves meaningful progress across swaps without
// wasting a delete on a habit the user made genuine progress on.
//
// STREAK BOUNDARY
// ───────────────
// streak() uses slot.created_at as the boundary date — the moment the slot was
// created. Logs before that date are invisible to the walker. This means re-adding
// a habit always starts fresh (slot_remove deletes the row; slot_add creates a
// new one with a new created_at).
//
// DATE FORMAT
// ───────────
// All date strings are IST (UTC+05:30) YYYY-MM-DD. See habitDate.ts.
// ═══════════════════════════════════════════════════════════════════════════════

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { HABIT_TEMPLATES } from "@/data/habits";
import { todayISO, yesterdayISO } from "@/utils/habitDate";
import type {
  HabitTemplate,
  UserHabit,
  HabitLog,
  FreezeLedgerRow,
  HabitSlot,
  HabitPauseEvent,
  MasteredEntry,
  LedgerReconcileEvent,
} from "@/types/app";
import {
  MAX_SLOTS,
  FREEZE_MILESTONE,
  MASTERY_MILESTONE,
  FREEZE_CAP,
  DEBT_FLOOR,
} from "@/types/app";
import { useSyncStore } from "@/stores/sync";
import { supabase } from "@/services/supabase";

// ─── Module-level helpers ─────────────────────────────────────────────────────

function isoNow(): string {
  return new Date().toISOString();
}

/** Shift a YYYY-MM-DD string one day back. */
function prevDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function buildUserHabit(
  template: HabitTemplate,
  streakVal: number,
  isMasteredVal: boolean,
  freezeUsedVal: boolean,
): UserHabit {
  return {
    id: template.id,
    templateId: template.id,
    name: template.name,
    icon: template.icon,
    iconOutline: template.iconOutline,
    sectionId: template.sectionId,
    prompt: template.prompt,
    when: template.when,
    instruction: template.instruction,
    streak: streakVal,
    lastLoggedDate: null,
    isPaused: false,
    freezeUsed: freezeUsedVal,
    isMastered: isMasteredVal,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMasteryStore = defineStore(
  "mastery",
  () => {
    // ── Local database arrays ─────────────────────────────────────────────────
    //
    // habit_logs and freeze_ledger are append-only — rows are pushed, never spliced.
    // habit_slots and pause_events are mutable state — rows may be updated or removed.
    // All five are persisted to localStorage as the local cache between sessions.

    const habitLogs = ref<HabitLog[]>([]);
    const freezeLedger = ref<FreezeLedgerRow[]>([]);
    const habitSlots = ref<HabitSlot[]>([]);
    const pauseEvents = ref<HabitPauseEvent[]>([]);
    const masteredArchive = ref<MasteredEntry[]>([]);

    // Session-scoped. Holds the outcome of the last reconcile() for UI notices.
    // Not persisted. Cleared when allLoggedToday fires.
    const lastReconcileEvents = ref<LedgerReconcileEvent[]>([]);

    // Populated from the Supabase auth session during hydrateFromSupabase().
    const userId = ref<string>("");

    // ── Internal read helpers ─────────────────────────────────────────────────

    /** True if habitLogs has any row for (templateId, date). */
    function hasLogForDate(templateId: string, date: string): boolean {
      return habitLogs.value.some((l) => l.template_id === templateId && l.date === date);
    }

    /**
     * True if the habit was in a paused state on the given IST date.
     * Used by the streak walker to skip pause/resume gaps transparently.
     *
     * R14 — prior-cycle isolation: pause windows whose paused_at predates
     * slot.created_at belong to a previous lifecycle and are ignored.
     * This ensures that re-adding a habit (new created_at) is a clean slate
     * even if old pause windows survive in the local array.
     *
     * A window covers `date` when:
     *   paused_at  <= end of day (window opened on or before this day)
     *   AND resumed_at is null OR resumed_at > start of day (window still open, or
     *   it closed during or after this day)
     */
    function isPausedOnDate(templateId: string, date: string): boolean {
      const slot = habitSlots.value.find((s) => s.template_id === templateId);
      if (!slot) return false;
      const boundary = slot.created_at;
      const endOfDay = date + "T23:59:59.999Z";
      const startOfDay = date + "T00:00:00.000Z";

      return pauseEvents.value.some((e) => {
        if (e.template_id !== templateId) return false;
        if (e.paused_at < boundary) return false; // R14: prior-cycle window
        if (e.paused_at > endOfDay) return false; // window not yet opened
        return e.resumed_at === null || e.resumed_at > startOfDay;
      });
    }

    // ── Derived values ────────────────────────────────────────────────────────

    /**
     * Streak for a template — count of consecutive 'yes' days walking backward.
     *
     * @param templateId  The habit to measure.
     * @param asOf        Optional anchor date (YYYY-MM-DD IST). Defaults to today.
     *
     * Boundary: slot.created_at — the moment the current lifecycle started.
     * Logs before this date are invisible to the walker.
     *
     * Walk rules (evaluated in order for each date):
     *   1. Log exists, value 'yes'                → count++, continue
     *   2. Log exists, value 'no'                 → continue (chain preserved, not counted)
     *   3. No log, date is today AND not anchored → skip (not yet logged, transparent)
     *   4. No log, isPausedOnDate returns true    → skip (pause gap, transparent)
     *   5. No log, spent row in freeze_ledger     → skip (cron protected this gap)
     *   6. No log, nothing                        → STOP (unprotected gap, streak ends)
     */
    function streak(templateId: string, asOf?: string): number {
      const slot = habitSlots.value.find((s) => s.template_id === templateId);
      if (!slot) return 0;

      const boundaryDate = slot.created_at.slice(0, 10);

      const logMap = new Map<string, "yes" | "no">();
      for (const l of habitLogs.value) {
        if (l.template_id === templateId && l.date >= boundaryDate) {
          logMap.set(l.date, l.value);
        }
      }

      const spentSet = new Set<string>();
      for (const r of freezeLedger.value) {
        if (r.template_id === templateId && r.reason === "spent") {
          spentSet.add(r.date);
        }
      }

      const referenceDate = asOf ?? todayISO();
      const isAnchored = asOf !== undefined;
      let count = 0;
      let dateStr = referenceDate;

      while (dateStr >= boundaryDate) {
        const value = logMap.get(dateStr);

        if (value !== undefined) {
          if (value === "yes") count++;
          dateStr = prevDate(dateStr);
          continue;
        }

        // No log for this date.
        if (dateStr === referenceDate && !isAnchored) {
          // Rule 3: today not yet logged — transparent.
          dateStr = prevDate(dateStr);
          continue;
        }

        if (isPausedOnDate(templateId, dateStr)) {
          // Rule 4: pause gap — transparent.
          dateStr = prevDate(dateStr);
          continue;
        }

        if (spentSet.has(dateStr)) {
          // Rule 5: cron protected this gap.
          dateStr = prevDate(dateStr);
          continue;
        }

        // Rule 6: unprotected gap — streak ends.
        break;
      }

      return count;
    }

    /**
     * The streak value the user had before the current gap broke it.
     * Anchors the walk to the most recent logged date so the pre-loss count
     * is returned even after the gap has already formed (streak() would return 0).
     */
    function lastKnownStreak(templateId: string): number {
      const lastLog = [...habitLogs.value]
        .filter((l) => l.template_id === templateId)
        .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
      if (!lastLog) return 0;
      return streak(templateId, lastLog.date);
    }

    /**
     * Net freeze token balance.
     * Spent rows are only effective when no habit_log exists for the same
     * (template_id, date) — a late yes/no implicitly refunds the token.
     * Balance is floored at DEBT_FLOOR.
     */
    const freezeCount = computed((): number => {
      const raw = freezeLedger.value.reduce((sum, row) => {
        if (row.reason !== "spent") return sum + row.delta;
        const logArrived = habitLogs.value.some(
          (l) => l.template_id === row.template_id && l.date === row.date,
        );
        return logArrived ? sum : sum + row.delta;
      }, 0);
      return Math.max(raw, DEBT_FLOOR);
    });

    function isLoggedToday(templateIdOrHabit: string | { templateId: string }): boolean {
      const tId =
        typeof templateIdOrHabit === "string" ? templateIdOrHabit : templateIdOrHabit.templateId;
      return hasLogForDate(tId, todayISO());
    }

    function isMastered(templateId: string): boolean {
      if (masteredArchive.value.some((m) => m.template_id === templateId)) return true;
      return streak(templateId) === MASTERY_MILESTONE;
    }

    /**
     * True if the cron spent a freeze token to protect this habit yesterday AND:
     *   - No log arrived for that date (which would make the spend a no-op).
     *   - The current streak is > 0 (the protection kept the chain alive).
     */
    function isFreezeUsed(templateId: string): boolean {
      if (streak(templateId) === 0) return false;
      const yesterday = yesterdayISO();
      const wasProtected = freezeLedger.value.some(
        (r) => r.template_id === templateId && r.date === yesterday && r.reason === "spent",
      );
      if (!wasProtected) return false;
      return !habitLogs.value.some((l) => l.template_id === templateId && l.date === yesterday);
    }

    // ── Computed habit lists ──────────────────────────────────────────────────
    //
    // All lists read directly from habitSlots.status — no event-scanning needed.

    /**
     * Active habits: status = 'active', not archived, streak < MASTERY_MILESTONE.
     * Habits at 66 go into masteredHabits instead.
     */
    const activeHabits = computed((): UserHabit[] => {
      const archivedIds = new Set(masteredArchive.value.map((m) => m.template_id));
      const result: UserHabit[] = [];
      for (const slot of habitSlots.value) {
        if (slot.status !== "active") continue;
        if (archivedIds.has(slot.template_id)) continue;
        const s = streak(slot.template_id);
        if (s === MASTERY_MILESTONE) continue;
        const template = HABIT_TEMPLATES.find((t) => t.id === slot.template_id);
        if (!template) continue;
        result.push(buildUserHabit(template, s, false, isFreezeUsed(slot.template_id)));
      }
      return result;
    });

    /** Paused habits: status = 'paused'. */
    const pausedHabits = computed((): UserHabit[] => {
      const result: UserHabit[] = [];
      for (const slot of habitSlots.value) {
        if (slot.status !== "paused") continue;
        const template = HABIT_TEMPLATES.find((t) => t.id === slot.template_id);
        if (!template) continue;
        result.push(
          buildUserHabit(template, streak(slot.template_id), false, isFreezeUsed(slot.template_id)),
        );
      }
      return result;
    });

    /**
     * Mastered habits awaiting the retire flow: status = 'active', streak = 66,
     * not yet archived. Still occupy a slot.
     */
    const masteredHabits = computed((): UserHabit[] => {
      const archivedIds = new Set(masteredArchive.value.map((m) => m.template_id));
      const result: UserHabit[] = [];
      for (const slot of habitSlots.value) {
        if (slot.status !== "active") continue;
        if (archivedIds.has(slot.template_id)) continue;
        if (streak(slot.template_id) !== MASTERY_MILESTONE) continue;
        const template = HABIT_TEMPLATES.find((t) => t.id === slot.template_id);
        if (!template) continue;
        result.push(buildUserHabit(template, MASTERY_MILESTONE, true, false));
      }
      return result;
    });

    const allLoggedToday = computed((): boolean => {
      if (activeHabits.value.length === 0) return false;
      return activeHabits.value.every((h) => isLoggedToday(h.templateId));
    });

    const unloggedToday = computed((): UserHabit[] =>
      activeHabits.value.filter((h) => !isLoggedToday(h.templateId)),
    );

    const daysToNextFreeze = computed((): number | null => {
      if (activeHabits.value.length === 0) return null;
      const values = activeHabits.value.map((h) => {
        const s = streak(h.templateId);
        return FREEZE_MILESTONE - (s % FREEZE_MILESTONE);
      });
      return Math.min(...values);
    });

    const daysToNextMastery = computed((): number | null => {
      const qualifying = activeHabits.value.filter((h) => streak(h.templateId) >= 1);
      if (qualifying.length === 0) return null;
      const values = qualifying.map((h) => {
        const s = streak(h.templateId);
        return MASTERY_MILESTONE - (s % MASTERY_MILESTONE);
      });
      return Math.min(...values);
    });

    const activeTemplateIds = computed(
      (): Set<string> => new Set(activeHabits.value.map((h) => h.templateId)),
    );
    const pausedTemplateIds = computed(
      (): Set<string> => new Set(pausedHabits.value.map((h) => h.templateId)),
    );

    const masteredTemplateIds = computed((): Set<string> => {
      const s = new Set(masteredArchive.value.map((m) => m.template_id));
      for (const h of masteredHabits.value) s.add(h.templateId);
      return s;
    });

    const masteredSlotTemplateIds = computed(
      (): Set<string> => new Set(masteredHabits.value.map((h) => h.templateId)),
    );

    /**
     * Active slot count — used to gate the add flow and displayed as N/3 in the UI.
     * Paused slots do not count toward the cap (R3).
     */
    const usedSlots = computed(
      (): number => habitSlots.value.filter((s) => s.status === "active").length,
    );

    // ── Actions ───────────────────────────────────────────────────────────────
    //
    // Each action:
    //   1. Updates local arrays optimistically (immediate UI feedback).
    //   2. Enqueues an RPC item in the sync queue.
    //
    // habit_slots and habit_pause_events are updated locally first, then the
    // corresponding SECURITY DEFINER RPC is enqueued. If the RPC fails with
    // slot_cap_exceeded, sync.ts calls the capRejectionCallback which re-hydrates
    // slot state from Supabase and reconciles.

    /** Add a habit to an available active slot. No-op if already active or paused. */
    function addHabit(template: HabitTemplate): void {
      if (activeTemplateIds.value.has(template.id) || pausedTemplateIds.value.has(template.id))
        return;
      const now = isoNow();
      // Optimistic: insert slot as active with created_at = now.
      habitSlots.value.push({
        user_id: userId.value,
        template_id: template.id,
        status: "active",
        created_at: now,
      });
      useSyncStore().enqueue({
        id: `slot_add:${userId.value}:${template.id}`,
        operation: "rpc",
        fn: "slot_add",
        payload: { p_user_id: userId.value, p_template_id: template.id },
        enqueuedAt: Date.now(),
      });
    }

    /** Pause a habit. Slot held, streak preserved, excluded from daily log flow. */
    function pauseHabit(templateId: string): void {
      const idx = habitSlots.value.findIndex((s) => s.template_id === templateId);
      if (idx === -1) return;
      // Optimistic: flip status to paused.
      habitSlots.value[idx] = { ...habitSlots.value[idx]!, status: "paused" };
      const now = isoNow();
      // Open a pause window locally.
      pauseEvents.value.push({
        user_id: userId.value,
        template_id: templateId,
        paused_at: now,
        resumed_at: null,
      });
      useSyncStore().enqueue({
        id: `slot_pause:${userId.value}:${templateId}:${now}`,
        operation: "rpc",
        fn: "slot_pause",
        payload: { p_user_id: userId.value, p_template_id: templateId },
        enqueuedAt: Date.now(),
      });
    }

    /** Resume a paused habit. Cap-gated — slot_resume RPC fires enforce_slot_cap. */
    function resumeHabit(templateId: string): void {
      const idx = habitSlots.value.findIndex((s) => s.template_id === templateId);
      if (idx === -1) return;
      // Optimistic: flip status to active.
      habitSlots.value[idx] = { ...habitSlots.value[idx]!, status: "active" };
      const now = isoNow();
      // Close the open pause window locally.
      const openIdx = pauseEvents.value.findIndex(
        (e) => e.template_id === templateId && e.resumed_at === null,
      );
      if (openIdx !== -1) {
        pauseEvents.value[openIdx] = { ...pauseEvents.value[openIdx]!, resumed_at: now };
      }
      useSyncStore().enqueue({
        id: `slot_resume:${userId.value}:${templateId}:${now}`,
        operation: "rpc",
        fn: "slot_resume",
        payload: { p_user_id: userId.value, p_template_id: templateId },
        enqueuedAt: Date.now(),
      });
    }

    /**
     * Remove a habit from its slot. Clean slate — on re-add, slot_add creates a
     * new row with a new created_at, making all prior logs invisible to the walker.
     * Closes any open pause window atomically (slot_remove RPC handles both).
     */
    function removeHabit(templateId: string): void {
      // Optimistic: remove slot row.
      const idx = habitSlots.value.findIndex((s) => s.template_id === templateId);
      if (idx !== -1) habitSlots.value.splice(idx, 1);
      // Close any open pause window locally.
      const now = isoNow();
      const openIdx = pauseEvents.value.findIndex(
        (e) => e.template_id === templateId && e.resumed_at === null,
      );
      if (openIdx !== -1) {
        pauseEvents.value[openIdx] = { ...pauseEvents.value[openIdx]!, resumed_at: now };
      }
      useSyncStore().enqueue({
        id: `slot_remove:${userId.value}:${templateId}`,
        operation: "rpc",
        fn: "slot_remove",
        payload: { p_user_id: userId.value, p_template_id: templateId },
        enqueuedAt: Date.now(),
      });
    }

    /**
     * Swap the outgoing habit for a new one (slots-full flow).
     *
     * R15 — conditional remove vs pause:
     *   streak > 0 → pause the outgoing habit (streak preserved, slot stays held)
     *   streak = 0 → remove the outgoing habit (clean slate, slot freed)
     *
     * addHabit runs after, occupying the freed or new slot.
     */
    function swapHabit(removeTemplateId: string, template: HabitTemplate): void {
      if (streak(removeTemplateId) > 0) {
        pauseHabit(removeTemplateId);
      } else {
        removeHabit(removeTemplateId);
      }
      addHabit(template);
    }

    /**
     * Log a habit for today. Idempotent — a second call for the same habit on
     * the same IST date is a no-op (hasLogForDate guard + unique DB constraint).
     *
     * 'yes' checks for milestone and mastery freeze token grants.
     * 'no' records the day without counting toward 66 or breaking the chain.
     */
    function logHabit(templateId: string, value: "yes" | "no"): void {
      const today = todayISO();
      if (hasLogForDate(templateId, today)) return;

      const now = isoNow();
      const logRow: HabitLog = {
        user_id: userId.value,
        template_id: templateId,
        date: today,
        value,
        created_at: now,
      };
      habitLogs.value.push(logRow);

      const syncStore = useSyncStore();
      syncStore.enqueue({
        id: `habit_logs:${userId.value}:${templateId}:${today}`,
        table: "habit_logs",
        operation: "upsert",
        payload: logRow,
        enqueuedAt: Date.now(),
      });

      if (value === "yes") {
        const s = streak(templateId); // recalculate after push

        if (s % FREEZE_MILESTONE === 0 && s < MASTERY_MILESTONE && freezeCount.value < FREEZE_CAP) {
          const milestoneRow: FreezeLedgerRow = {
            user_id: userId.value,
            template_id: templateId,
            delta: +1,
            reason: "milestone",
            date: today,
            created_at: isoNow(),
          };
          freezeLedger.value.push(milestoneRow);
          syncStore.enqueue({
            id: `freeze_ledger:${userId.value}:${templateId}:${today}:milestone`,
            table: "freeze_ledger",
            operation: "upsert",
            payload: milestoneRow,
            enqueuedAt: Date.now(),
          });
        }

        if (s === MASTERY_MILESTONE) {
          const masteryRow: FreezeLedgerRow = {
            user_id: userId.value,
            template_id: templateId,
            delta: +1,
            reason: "mastery",
            date: today,
            created_at: isoNow(),
          };
          freezeLedger.value.push(masteryRow);
          syncStore.enqueue({
            id: `freeze_ledger:${userId.value}:${templateId}:${today}:mastery`,
            table: "freeze_ledger",
            operation: "upsert",
            payload: masteryRow,
            enqueuedAt: Date.now(),
          });
        }
      }
    }

    /**
     * Retire a mastered habit from its slot into the permanent archive.
     * slot_retire RPC handles: close pause window + delete slot + insert mastered_archive.
     * masteredArchive is also written locally for immediate UI update.
     */
    function retireHabit(templateId: string): void {
      // Optimistic: remove slot.
      const idx = habitSlots.value.findIndex((s) => s.template_id === templateId);
      if (idx !== -1) habitSlots.value.splice(idx, 1);
      // Close any open pause window locally.
      const now = isoNow();
      const openIdx = pauseEvents.value.findIndex(
        (e) => e.template_id === templateId && e.resumed_at === null,
      );
      if (openIdx !== -1) {
        pauseEvents.value[openIdx] = { ...pauseEvents.value[openIdx]!, resumed_at: now };
      }
      // Write masteredArchive locally so masteredTemplateIds updates immediately.
      const archiveEntry: MasteredEntry = {
        user_id: userId.value,
        template_id: templateId,
        created_at: now,
      };
      masteredArchive.value.push(archiveEntry);

      // Enqueue RPC — slot_retire handles the DB side atomically.
      // masteredArchive is also written via direct upsert so the local row
      // survives if the RPC fires first and Realtime returns the archive row.
      const syncStore = useSyncStore();
      syncStore.enqueue({
        id: `slot_retire:${userId.value}:${templateId}`,
        operation: "rpc",
        fn: "slot_retire",
        payload: { p_user_id: userId.value, p_template_id: templateId },
        enqueuedAt: Date.now(),
      });
      syncStore.enqueue({
        id: `mastered_archive:${userId.value}:${templateId}`,
        table: "mastered_archive",
        operation: "upsert",
        payload: archiveEntry,
        enqueuedAt: Date.now(),
      });
    }

    // ── Reconciliation ────────────────────────────────────────────────────────
    //
    // Read-only. Produces lastReconcileEvents for UI "streak lost" notices.
    // The boundary check uses slot.created_at — a habit added today with no
    // history is not considered missed.

    function reconcile(): void {
      const yesterday = yesterdayISO();

      const lostHabits = activeHabits.value.filter((h) => {
        if (hasLogForDate(h.templateId, yesterday)) return false;

        const wasProtected = freezeLedger.value.some(
          (r) => r.template_id === h.templateId && r.date === yesterday && r.reason === "spent",
        );
        if (wasProtected) return false;

        // Only flag as lost if the habit was in the slot before yesterday.
        const slot = habitSlots.value.find((s) => s.template_id === h.templateId);
        if (!slot) return false;
        return slot.created_at.slice(0, 10) < yesterday;
      });

      lastReconcileEvents.value = lostHabits.map((h) => ({
        type: "lost" as const,
        templateId: h.templateId,
        streak: lastKnownStreak(h.templateId),
      }));
    }

    function clearReconcileEvents(): void {
      lastReconcileEvents.value = [];
    }

    // ── Hydration ─────────────────────────────────────────────────────────────
    //
    // habit_logs, freeze_ledger, mastered_archive — union merge (append-only,
    // local-wins: server rows not present locally are appended, local rows kept).
    //
    // habit_slots, habit_pause_events — full replace (server is authoritative;
    // all writes go through RPCs so the server always has the canonical state).
    //
    // Called by AuthView on cold start and by App.vue on reconnect.

    async function hydrateFromSupabase(newUserId: string, _forceRemote = false): Promise<void> {
      userId.value = newUserId;

      const [logsRes, freezeRes, slotsRes, pauseRes, archiveRes] = await Promise.all([
        supabase.from("habit_logs").select("*").eq("user_id", newUserId),
        supabase.from("freeze_ledger").select("*").eq("user_id", newUserId),
        supabase.from("habit_slots").select("*").eq("user_id", newUserId),
        supabase.from("habit_pause_events").select("*").eq("user_id", newUserId),
        supabase.from("mastered_archive").select("*").eq("user_id", newUserId),
      ]);

      if (logsRes.error) throw logsRes.error;
      if (freezeRes.error) throw freezeRes.error;
      if (slotsRes.error) throw slotsRes.error;
      if (pauseRes.error) throw pauseRes.error;
      if (archiveRes.error) throw archiveRes.error;

      // habit_slots — full replace (R9: server is canonical)
      habitSlots.value = slotsRes.data as HabitSlot[];

      // habit_pause_events — full replace (R10)
      pauseEvents.value = pauseRes.data as HabitPauseEvent[];

      // habit_logs — union merge
      const localLogKeys = new Set(habitLogs.value.map((l) => `${l.template_id}:${l.date}`));
      for (const row of logsRes.data as HabitLog[]) {
        if (!localLogKeys.has(`${row.template_id}:${row.date}`)) {
          habitLogs.value.push(row);
        }
      }

      // freeze_ledger — union merge
      const localFreezeKeys = new Set(
        freezeLedger.value.map((r) => `${r.template_id}:${r.date}:${r.reason}`),
      );
      for (const row of freezeRes.data as FreezeLedgerRow[]) {
        if (!localFreezeKeys.has(`${row.template_id}:${row.date}:${row.reason}`)) {
          freezeLedger.value.push(row);
        }
      }

      // mastered_archive — union merge
      const localArchiveKeys = new Set(masteredArchive.value.map((m) => m.template_id));
      for (const row of archiveRes.data as MasteredEntry[]) {
        if (!localArchiveKeys.has(row.template_id)) {
          masteredArchive.value.push(row);
        }
      }
    }

    // ── Realtime merge handlers ───────────────────────────────────────────────
    //
    // Called by sync.ts Realtime listeners.
    //
    // habit_slots: INSERT / UPDATE / DELETE
    //   INSERT — new habit added from another device
    //   UPDATE — status changed (pause / resume) from another device
    //   DELETE — removed or retired from another device
    //
    // habit_pause_events: INSERT / UPDATE
    //   INSERT — pause opened from another device
    //   UPDATE — pause closed (resumed_at set) from another device
    //
    // habit_logs, freeze_ledger, mastered_archive: INSERT only (append-only).

    function mergeHabitSlot(row: HabitSlot, eventType: "INSERT" | "UPDATE" | "DELETE"): void {
      const idx = habitSlots.value.findIndex((s) => s.template_id === row.template_id);
      if (eventType === "DELETE") {
        if (idx !== -1) habitSlots.value.splice(idx, 1);
      } else if (eventType === "UPDATE") {
        if (idx !== -1) habitSlots.value[idx] = row;
        else habitSlots.value.push(row);
      } else {
        // INSERT
        if (idx === -1) habitSlots.value.push(row);
      }
    }

    function mergePauseEvent(row: HabitPauseEvent, eventType: "INSERT" | "UPDATE"): void {
      const idx = pauseEvents.value.findIndex(
        (e) => e.template_id === row.template_id && e.paused_at === row.paused_at,
      );
      if (eventType === "UPDATE") {
        if (idx !== -1) pauseEvents.value[idx] = row;
        else pauseEvents.value.push(row);
      } else {
        // INSERT
        if (idx === -1) pauseEvents.value.push(row);
      }
    }

    function mergeHabitLog(row: HabitLog): void {
      const exists = habitLogs.value.some(
        (l) => l.template_id === row.template_id && l.date === row.date,
      );
      if (!exists) habitLogs.value.push(row);
    }

    function mergeFreezeLedgerRow(row: FreezeLedgerRow): void {
      const exists = freezeLedger.value.some(
        (r) => r.template_id === row.template_id && r.date === row.date && r.reason === row.reason,
      );
      if (!exists) freezeLedger.value.push(row);
    }

    function mergeMasteredArchiveRow(row: MasteredEntry): void {
      const exists = masteredArchive.value.some((m) => m.template_id === row.template_id);
      if (!exists) masteredArchive.value.push(row);
    }

    return {
      // Local database (persist targets)
      habitLogs,
      freezeLedger,
      habitSlots,
      pauseEvents,
      masteredArchive,
      lastReconcileEvents,
      userId,

      // Derived habit lists
      activeHabits,
      pausedHabits,
      masteredHabits,
      unloggedToday,

      // Derived Sets for HabitLibrary membership checks
      activeTemplateIds,
      pausedTemplateIds,
      masteredTemplateIds,
      masteredSlotTemplateIds,

      // Derived scalars
      freezeCount,
      daysToNextFreeze,
      daysToNextMastery,
      allLoggedToday,
      usedSlots,

      // Per-template derived functions
      isLoggedToday,
      isMastered,
      streak,

      // Actions
      addHabit,
      removeHabit,
      pauseHabit,
      resumeHabit,
      swapHabit,
      logHabit,
      retireHabit,
      reconcile,
      clearReconcileEvents,
      hydrateFromSupabase,

      // Realtime merge handlers (called by sync.ts)
      mergeHabitLog,
      mergeFreezeLedgerRow,
      mergeHabitSlot,
      mergePauseEvent,
      mergeMasteredArchiveRow,

      MAX_SLOTS,
    };
  },
  {
    persist: {
      pick: ["habitLogs", "freezeLedger", "habitSlots", "pauseEvents", "masteredArchive"],
    },
  },
);
