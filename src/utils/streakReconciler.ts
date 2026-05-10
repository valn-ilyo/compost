import type { UserHabit, ReconcileEvent, ReconcileResult } from "@/types/app";

// ─── Constants ────────────────────────────────────────────────────────────────
/** Maximum debt allowed when a tied group drains the freeze pool below zero. */
const DEBT_FLOOR = -2;

// ─── Core ─────────────────────────────────────────────────────────────────────

/**
 * Reconciles streaks against today's UTC date.
 *
 * For every active habit whose lastLoggedDate is neither today nor yesterday
 * (i.e. the user missed at least one full day):
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
 *   • freezeCount > 0 at the moment the group is reached → save all habits in
 *     the group, decrementing one token per habit. freezeCount may go negative
 *     (debt), clamped at DEBT_FLOOR (−2).
 *   • freezeCount ≤ 0 → no credit extended; all habits in the group lose.
 *
 * Slot items are mutated in place (streak, freezeUsed, lastLoggedDate).
 * Paused and mastered habits are skipped entirely.
 */
export function reconcile(
  slots: UserHabit[],
  freezeCount: number,
  existingEvents: ReconcileEvent[],
  today: string,
  yesterday: string,
): ReconcileResult {
  let currentFreezeCount = freezeCount;

  // Habits that are fine and just need their freezeUsed flag cleared.
  for (const habit of slots) {
    if (!habit.isPaused && !habit.isMastered && habit.streak === 0) habit.freezeUsed = false;
  }

  // Habits that missed at least one full day.
  const missed = slots.filter(
    (h) =>
      !h.isPaused &&
      !h.isMastered &&
      h.streak > 0 &&
      h.lastLoggedDate !== null &&
      h.lastLoggedDate < today &&
      h.lastLoggedDate !== yesterday,
  );

  // Sort descending so higher streaks are processed first.
  missed.sort((a, b) => b.streak - a.streak);

  // Partition into consecutive equal-streak groups so tied habits are always
  // saved or lost together — no arbitrary winner within a tier.
  const groups: UserHabit[][] = [];
  for (const habit of missed) {
    const last = groups[groups.length - 1];
    if (last && last[0]!.streak === habit.streak) {
      last.push(habit);
    } else {
      groups.push([habit]);
    }
  }

  const newEvents: ReconcileEvent[] = [];

  for (const group of groups) {
    const isTied = group.length > 1;

    if (!isTied) {
      // ── Solo habit ───────────────────────────────────────────────────────
      const habit = group[0]!;
      if (currentFreezeCount > 0) {
        currentFreezeCount--;
        habit.freezeUsed = true;
        habit.lastLoggedDate = yesterday;
        newEvents.push({
          type: "frozen",
          habitId: habit.id,
          habitName: habit.name,
          streak: habit.streak,
        });
      } else {
        newEvents.push({
          type: "lost",
          habitId: habit.id,
          habitName: habit.name,
          streak: habit.streak,
        });
        habit.streak = 0;
        habit.freezeUsed = false;
      }
    } else if (currentFreezeCount > 0) {
      // ── Tied group, tokens available → save all, allow debt ──────────────
      // Eligibility is evaluated once at group entry. If tokens drained by an
      // earlier group, this group gets nothing — no retroactive refund.
      for (const habit of group) {
        currentFreezeCount = Math.max(currentFreezeCount - 1, DEBT_FLOOR);
        habit.freezeUsed = true;
        habit.lastLoggedDate = yesterday;
        newEvents.push({
          type: "frozen",
          habitId: habit.id,
          habitName: habit.name,
          streak: habit.streak,
        });
      }
    } else {
      // ── Tied group, no tokens → whole group loses ─────────────────────────
      for (const habit of group) {
        newEvents.push({
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

  if (newEvents.length > 0) {
    // New missed habits — replace with the authoritative current set.
    return { events: newEvents, newFreezeCount: currentFreezeCount };
  }

  // Clean run — prune stale events whose habits have since recovered or been logged.
  // Keep any event whose habit hasn't been logged today — frozen (streak > 0)
  // and lost (streak === 0) alike. Events for habits already logged today were
  // already cleared inside logHabit, so this can't produce ghost notices.
  const pruned = existingEvents.filter((e) => {
    const habit = slots.find((h) => h.id === e.habitId);
    return habit != null && habit.lastLoggedDate !== today;
  });
  return { events: pruned, newFreezeCount: currentFreezeCount };
}