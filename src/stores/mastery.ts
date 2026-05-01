import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { clock } from "@/stores/clock";

import type { HabitTemplate, UserHabit } from "@/types/app.types";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single event produced by reconcileStreaks describing what happened to one
 * habit when the user missed a day. Persisted so they survive a page refresh
 * and are visible on the next app open above the "Log today" button.
 *
 * Cleared per-habit by logHabit() the moment the user logs that habit, and
 * fully cleared by clearReconcileEvents() once all habits are logged today.
 *
 * habitId is used (not habitName) so matching in the UI is safe even if two
 * habits happen to share the same display name.
 */
export type ReconcileEvent =
  | { type: "frozen"; habitId: string; habitName: string; streak: number }
  | { type: "lost"; habitId: string; habitName: string; streak: number };

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SLOTS = 3;
const FREEZE_MILESTONE = 14;
const FREEZE_CAP = MAX_SLOTS; // one freeze per active slot max

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the current date as a UTC ISO string (YYYY-MM-DD).
 * Using toISOString() guarantees UTC — never use new Date("YYYY-MM-DD").getDate()
 * which returns a local-time value and can shift the date in non-UTC zones.
 */

/**
 * Returns yesterday's date as a UTC ISO string (YYYY-MM-DD).
 * setUTCDate / getUTCDate are used throughout so arithmetic stays in UTC
 * regardless of the device's local timezone (e.g. IST = UTC+5:30).
 */

function fromTemplate(template: HabitTemplate): UserHabit {
  return {
    id: String(Date.now()),
    templateId: template.id,
    name: template.name,
    icon: template.icon,
    iconOutline: template.iconOutline,
    sectionId: template.sectionId,
    prompt: template.prompt,
    when: template.when,
    instruction: template.instruction,
    streak: 0,
    lastLoggedDate: null,
    isPaused: false,
    freezeUsed: false,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMasteryStore = defineStore(
  "mastery",
  () => {
    const slots = ref<UserHabit[]>([]);
    const freezeCount = ref(0);

    /**
     * Events produced by the most recent reconcileStreaks call.
     * Persisted so they survive a page refresh and remain visible on next open.
     * Cleared per-habit when that habit is logged (logHabit), and fully
     * cleared by clearReconcileEvents() once all habits are logged today.
     */
    const lastReconcileEvents = ref<ReconcileEvent[]>([]);

    // ── Derived ───────────────────────────────────────────────────────────────

    const activeHabits = computed(() => slots.value.filter((h) => !h.isPaused));
    const pausedHabits = computed(() => slots.value.filter((h) => h.isPaused));

    const activeTemplateIds = computed(() => new Set(activeHabits.value.map((h) => h.templateId)));
    const pausedTemplateIds = computed(() => new Set(pausedHabits.value.map((h) => h.templateId)));

    const freezeCap = computed(() => Math.min(activeHabits.value.length, FREEZE_CAP));

    const daysToNextFreeze = computed(() => {
      if (activeHabits.value.length === 0) return null;
      // Use the habit closest to its next milestone — i.e. the smallest
      // remaining distance across all active habits — so the display
      // reflects the soonest any habit will earn a freeze token.
      return Math.min(
        ...activeHabits.value.map((h) => FREEZE_MILESTONE - (h.streak % FREEZE_MILESTONE)),
      );
    });

    function isLoggedToday(habit: UserHabit): boolean {
      return habit.lastLoggedDate === todayISO();
    }

    const unloggedToday = computed(() => activeHabits.value.filter((h) => !isLoggedToday(h)));

    const allLoggedToday = computed(
      () => activeHabits.value.length > 0 && unloggedToday.value.length === 0,
    );

    // ── Actions ───────────────────────────────────────────────────────────────

    function addHabit(template: HabitTemplate): void {
      if (activeHabits.value.length >= MAX_SLOTS) return;
      if (activeTemplateIds.value.has(template.id)) return;
      slots.value.push(fromTemplate(template));
    }

    function removeHabit(id: string): void {
      slots.value = slots.value.filter((h) => h.id !== id);
      lastReconcileEvents.value = lastReconcileEvents.value.filter((e) => e.habitId !== id);
      if (freezeCount.value > freezeCap.value) {
        freezeCount.value = freezeCap.value;
      }
    }

    function pauseHabit(id: string): void {
      const habit = slots.value.find((h) => h.id === id);
      if (!habit) return;
      // A 0-streak habit has nothing worth saving — remove it outright
      // rather than leaving a misleading "0-day streak saved" entry in the
      // paused list.
      if (habit.streak === 0) {
        removeHabit(id);
      } else {
        habit.isPaused = true;
      }
    }

    function resumeHabit(id: string): void {
      const habit = slots.value.find((h) => h.id === id);
      if (!habit) return;
      habit.isPaused = false;
      // Only backfill to yesterday if not already logged today — prevents
      // double-logging on the same day after a pause/resume cycle.
      if (habit.lastLoggedDate !== todayISO()) {
        habit.lastLoggedDate = yesterdayISO();
      }
    }

    /**
     * Swap out an active habit for a new template, placing the incoming habit
     * at the exact slot position of the one being removed.
     *
     * Strategy:
     * 1. Record targetIdx before mutating slots so the insert position is stable.
     * 2. Outgoing habit: pause (streak preserved) or remove (streak=0).
     * 3. Incoming habit: reuse an existing paused instance if one exists,
     *    otherwise create fresh from template.
     * 4. If reusing a paused habit, splice it out of its current position first
     *    (adjusting insertIdx if the removal shifted things), then splice it in
     *    at the target position.
     * 5. Always splice — never push — so the incoming row lands where the
     *    outgoing one was. TransitionGroup sees a leave at N and an enter at N,
     *    producing a clean in-place swap with no spurious bubble.
     */
    function swapHabit(removeId: string, template: HabitTemplate): void {
      const targetIdx = slots.value.findIndex((h) => h.id === removeId);
      if (targetIdx === -1) return;
      const target = slots.value[targetIdx]!;

      // Clear any stale reconcile event for the outgoing habit.
      lastReconcileEvents.value = lastReconcileEvents.value.filter((e) => e.habitId !== removeId);

      // Handle outgoing: pause in place (streak survives) or remove entirely.
      if (target.streak > 0) {
        target.isPaused = true;
        // Slot stays in the array; incoming will be spliced before it.
      } else {
        slots.value.splice(targetIdx, 1);
        // targetIdx now points to whatever was after the removed item — exactly
        // where we want the incoming habit.
      }

      // insertIdx starts at targetIdx and may be adjusted below.
      let insertIdx = targetIdx;

      // Check whether the incoming template already exists as a paused habit.
      const existingPaused = slots.value.find((h) => h.templateId === template.id && h.isPaused);

      if (existingPaused) {
        // Move the paused habit to the target position rather than activating
        // it in place (which would leave it at an arbitrary slot).
        const existingIdx = slots.value.indexOf(existingPaused);
        slots.value.splice(existingIdx, 1);

        // Removing existingPaused shifts everything after it left by one.
        // If existingIdx < insertIdx the target position has shifted down.
        if (existingIdx < insertIdx) insertIdx--;

        existingPaused.isPaused = false;
        if (existingPaused.lastLoggedDate !== todayISO()) {
          existingPaused.lastLoggedDate = yesterdayISO();
        }
        slots.value.splice(insertIdx, 0, existingPaused);
      } else {
        slots.value.splice(insertIdx, 0, fromTemplate(template));
      }
    }

    /**
     * Reconcile streaks against the current UTC date.
     *
     * Called automatically on every app open (see App.vue) and after any
     * artificial date shift (e.g. DevView's simulate-new-day).
     *
     * For every active habit whose lastLoggedDate is neither today nor yesterday
     * (i.e. the user missed at least one full day without logging):
     *
     * Habits are sorted by streak descending and partitioned into consecutive
     * equal-streak groups before processing. This eliminates the arbitrary
     * tie-break that existed when habits shared the same streak — within a
     * group every habit is saved or lost together.
     *
     * Solo group (one habit at that streak level):
     *   • freezeCount > 0 → spend one token, protect streak.
     *   • freezeCount ≤ 0 → streak reset to 0.
     *
     * Tied group (two or more habits at the same streak level):
     *   • freezeCount > 0 at the moment the group is reached → save all
     *     habits in the group, decrementing one token per habit. freezeCount
     *     may go negative (debt), clamped at DEBT_FLOOR (−2). The user has
     *     to earn their way back to 0 before tokens are usable again.
     *   • freezeCount ≤ 0 → no credit extended; all habits in the group lose.
     *
     * Debt recovery: logHabit() already increments freezeCount on each milestone
     * with no special casing needed — milestones tick debt toward 0 then positive
     * regardless of which habit earns them.
     *
     * Paused habits are skipped — they are not expected to be logged.
     * Habits with no streak yet (streak === 0) only need their freezeUsed
     * flag cleared; there is nothing to protect.
     *
     * Freeze/lost events are written to lastReconcileEvents so MasteryView can
     * surface what happened on the habit card. On a clean run (nothing missed),
     * stale events are pruned: any event whose habit has since recovered
     * (streak > 0) or been logged today is dropped. Events for habits still
     * at streak=0 and unlogged are kept so the loss chip remains visible.
     */
    function reconcileStreaks(): void {
      const today = todayISO();
      const yesterday = yesterdayISO();

      // Separate habits into those that are fine and those that missed a day.
      // lastLoggedDate < today (not !== today) so that future-dated logs caused
      // by the dev clock going backward are never misclassified as missed.
      const missed = slots.value.filter(
        (h) =>
          !h.isPaused &&
          h.streak > 0 &&
          h.lastLoggedDate !== null &&
          h.lastLoggedDate < today &&
          h.lastLoggedDate !== yesterday,
      );

      // Clear streak=0 habits that just need their freezeUsed flag reset.
      for (const habit of slots.value) {
        if (!habit.isPaused && habit.streak === 0) habit.freezeUsed = false;
      }

      // Sort descending so higher streaks are processed first.
      missed.sort((a, b) => b.streak - a.streak);

      // Partition into consecutive equal-streak groups so tied habits are
      // always saved or lost together — no arbitrary winner within a tier.
      const groups: UserHabit[][] = [];
      for (const habit of missed) {
        const last = groups[groups.length - 1];
        if (last && last[0]!.streak === habit.streak) {
          last.push(habit);
        } else {
          groups.push([habit]);
        }
      }

      const DEBT_FLOOR = -2;
      const events: ReconcileEvent[] = [];

      for (const group of groups) {
        const isTied = group.length > 1;

        if (!isTied) {
          // ── Solo habit — original logic, debt never applies ──────────────
          const habit = group[0]!;
          if (freezeCount.value > 0) {
            freezeCount.value--;
            habit.freezeUsed = true;
            habit.lastLoggedDate = yesterday;
            events.push({
              type: "frozen",
              habitId: habit.id,
              habitName: habit.name,
              streak: habit.streak,
            });
          } else {
            events.push({
              type: "lost",
              habitId: habit.id,
              habitName: habit.name,
              streak: habit.streak,
            });
            habit.streak = 0;
            habit.freezeUsed = false;
          }
        } else if (freezeCount.value > 0) {
          // ── Tied group, tokens available → save all, allow debt ──────────
          // Eligibility is evaluated once at group entry: if freezeCount > 0
          // when this group is reached, the whole group is covered. Tokens
          // spent by earlier (higher-streak) groups are not retroactively
          // refunded — if they drained the pool the tied group gets nothing.
          for (const habit of group) {
            freezeCount.value = Math.max(freezeCount.value - 1, DEBT_FLOOR);
            habit.freezeUsed = true;
            habit.lastLoggedDate = yesterday;
            events.push({
              type: "frozen",
              habitId: habit.id,
              habitName: habit.name,
              streak: habit.streak,
            });
          }
        } else {
          // ── Tied group, no tokens → whole group loses ────────────────────
          for (const habit of group) {
            events.push({
              type: "lost",
              habitId: habit.id,
              habitName: habit.name,
              streak: habit.streak,
            });
            habit.streak = 0;
            habit.freezeUsed = false;
          }
        }
      }

      if (events.length > 0) {
        // New missed habits — replace events with the authoritative current set.
        lastReconcileEvents.value = events;
      } else {
        // Clean run — prune any stale events whose habits are now fine.
        // Keep only events for habits that are still at streak=0 and haven't
        // logged today (i.e. the user still needs to address the loss notice).
        lastReconcileEvents.value = lastReconcileEvents.value.filter((e) => {
          const habit = slots.value.find((h) => h.id === e.habitId);
          return habit != null && habit.streak === 0 && !isLoggedToday(habit);
        });
      }
    }

    /** Called by MasteryView once all habits are logged today. */
    function clearReconcileEvents(): void {
      lastReconcileEvents.value = [];
    }

    function logHabit(id: string, didIt: boolean): void {
      const habit = slots.value.find((h) => h.id === id);
      if (!habit || isLoggedToday(habit)) return;

      const today = todayISO();
      const yesterday = yesterdayISO();

      // Clear any reconcile event for this habit — the user is addressing it now.
      // This ensures the "X-day streak lost" chip disappears immediately on log,
      // rather than lingering until every other habit is also logged.
      lastReconcileEvents.value = lastReconcileEvents.value.filter((e) => e.habitId !== id);

      if (didIt) {
        const wasConsecutive = habit.lastLoggedDate === yesterday || habit.lastLoggedDate === null;
        habit.streak = wasConsecutive ? habit.streak + 1 : 1;

        if (habit.streak % FREEZE_MILESTONE === 0 && freezeCount.value < freezeCap.value) {
          freezeCount.value++;
        }
      }
      // "No" is an honest log — it records that the user checked in but didn't do the habit.
      // Streaks and freeze tokens are untouched; reconcileStreaks handles missed days (no log at all).

      // Clear the freeze indicator on any log — the chip is only meaningful on the
      // day the freeze was consumed; once the user checks in it should not persist.
      habit.freezeUsed = false;
      habit.lastLoggedDate = today;
    }

    function todayISO(): string {
      return clock.now().toISOString().slice(0, 10);
    }
    function yesterdayISO(): string {
      const d = clock.now();
      d.setUTCDate(d.getUTCDate() - 1);
      return d.toISOString().slice(0, 10);
    }

    return {
      // state
      slots,
      freezeCount,
      lastReconcileEvents,
      // getters
      activeHabits,
      pausedHabits,
      activeTemplateIds,
      pausedTemplateIds,
      freezeCap,
      daysToNextFreeze,
      allLoggedToday,
      unloggedToday,
      isLoggedToday,
      // actions
      addHabit,
      removeHabit,
      pauseHabit,
      resumeHabit,
      swapHabit,
      logHabit,
      reconcileStreaks,
      clearReconcileEvents,
    };
  },
  {
    persist: true,
  },
);
          
