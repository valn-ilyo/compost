import type { HabitTemplate, UserHabit, LogResult } from "@/types/app";
import { MAX_SLOTS, FREEZE_MILESTONE, MASTERY_MILESTONE } from "@/types/app";

export { MAX_SLOTS, FREEZE_MILESTONE, MASTERY_MILESTONE };

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function fromTemplate(template: HabitTemplate): UserHabit {
  return {
    id: String(Date.now() + Math.random()),
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
    isMastered: false,
  };
}

// ─── Slot mutations ───────────────────────────────────────────────────────────
//
// All functions receive slots.value — Vue 3's reactive Proxy — so in-place
// mutations (splice, property assignment) are tracked automatically.
// Functions that must filter return a new array; the store reassigns slots.value.

/** Pushes a new habit into the slot array. No-ops if the slot or template
 *  duplicate checks fail. Caller is responsible for checking usedSlots. */
export function addHabitToSlots(
  slots: UserHabit[],
  template: HabitTemplate,
  usedSlots: number,
  activeTemplateIds: Set<string>,
  pausedTemplateIds: Set<string>,
): void {
  if (
    usedSlots >= MAX_SLOTS ||
    activeTemplateIds.has(template.id) ||
    pausedTemplateIds.has(template.id)
  )
    return;
  slots.push(fromTemplate(template));
}

/** Returns a new filtered array with the habit removed. */
export function removeHabitFromSlots(slots: UserHabit[], id: string): UserHabit[] {
  return slots.filter((h) => h.id !== id);
}

/**
 * Pauses a habit.
 * - streak === 0 → remove outright; returns new filtered array.
 * - streak > 0  → sets isPaused in place; returns null (no reassignment needed).
 */
export function pauseHabitInSlots(slots: UserHabit[], id: string): UserHabit[] | null {
  const habit = slots.find((h) => h.id === id);
  if (!habit) return null;
  if (habit.streak === 0) return slots.filter((h) => h.id !== id);
  habit.isPaused = true;
  return null;
}

/** Resumes a paused habit and backfills lastLoggedDate to yesterday if needed. */
export function resumeHabitInSlots(
  slots: UserHabit[],
  id: string,
  today: string,
  yesterday: string,
): void {
  const habit = slots.find((h) => h.id === id);
  if (!habit) return;
  habit.isPaused = false;
  if (habit.lastLoggedDate !== today) habit.lastLoggedDate = yesterday;
}

/**
 * Swaps the habit at removeId for the incoming template, preserving slot
 * position. Caller must clear the outgoing reconcile event before calling.
 *
 * Strategy:
 * 1. Record targetIdx before any mutation.
 * 2. Outgoing: pause in place (streak preserved) or splice out (streak = 0).
 * 3. Incoming: reuse existing paused instance if one exists, else create fresh.
 * 4. Splice the incoming habit into the target position so TransitionGroup
 *    sees a clean in-place swap — no spurious bubble.
 */
export function swapHabitInSlots(
  slots: UserHabit[],
  removeId: string,
  template: HabitTemplate,
  today: string,
  yesterday: string,
): void {
  const targetIdx = slots.findIndex((h) => h.id === removeId);
  if (targetIdx === -1) return;
  const target = slots[targetIdx]!;

  if (target.streak > 0) {
    target.isPaused = true;
    // Slot stays; incoming is spliced before it.
  } else {
    slots.splice(targetIdx, 1);
    // targetIdx now points to whatever was after the removed item.
  }

  let insertIdx = targetIdx;

  const existingPaused = slots.find((h) => h.templateId === template.id && h.isPaused);

  if (existingPaused) {
    const existingIdx = slots.indexOf(existingPaused);
    slots.splice(existingIdx, 1);
    if (existingIdx < insertIdx) insertIdx--;
    existingPaused.isPaused = false;
    if (existingPaused.lastLoggedDate !== today) existingPaused.lastLoggedDate = yesterday;
    slots.splice(insertIdx, 0, existingPaused);
  } else {
    slots.splice(insertIdx, 0, fromTemplate(template));
  }
}

// ─── Log ─────────────────────────────────────────────────────────────────────

/**
 * Applies a daily log to a habit.
 * Returns null if the log is rejected (already logged, mastered, or not found).
 * Returns a LogResult describing side-effects the store should apply.
 * Habit item is mutated in place.
 */
export function logHabitInSlots(
  slots: UserHabit[],
  id: string,
  didIt: boolean,
  today: string,
  yesterday: string,
  freezeCount: number,
  freezeCap: number,
): LogResult | null {
  const habit = slots.find((h) => h.id === id);
  if (!habit || habit.lastLoggedDate === today || habit.isMastered) return null;

  let freezeEarned = false;
  let mastered = false;

  if (didIt) {
    const wasConsecutive = habit.lastLoggedDate === yesterday || habit.lastLoggedDate === null;
    habit.streak = wasConsecutive ? habit.streak + 1 : 1;

    if (habit.streak === MASTERY_MILESTONE) {
      mastered = true;
      habit.isMastered = true;
      // Mastery reward is applied by the store — unconditional, can overflow past freezeCap.
      // Normal milestone grants (22, 44…) are blocked when freezeCount >= freezeCap,
      // so overflow is only reachable via mastery.
    } else if (habit.streak % FREEZE_MILESTONE === 0 && freezeCount < freezeCap) {
      freezeEarned = true;
    }
  }

  // "No" is an honest log — streaks and freeze tokens are untouched.
  // Missed days (no log at all) are handled by reconcileStreaks.
  habit.freezeUsed = false;
  habit.lastLoggedDate = today;

  return { freezeEarned, mastered };
}
