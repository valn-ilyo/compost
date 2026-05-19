// ─── HOLLOWED — Phase 2 ───────────────────────────────────────────────────────
// This file is replaced entirely by store actions in Phase 3.
// The old implementation operated on mutable UserHabit[] (slots array).
// The new implementation appends immutable events to slotEvents and habitLogs.
//
// TODO [Phase 3] Delete this file. All logic folds into stores/mastery.ts actions:
//   addHabitToSlots    → masteryStore.addHabit()
//   removeHabitFromSlots → masteryStore.removeHabit()
//   pauseHabitInSlots  → masteryStore.pauseHabit()
//   resumeHabitInSlots → masteryStore.resumeHabit()
//   swapHabitInSlots   → masteryStore.swapHabit()
//   logHabitInSlots    → masteryStore.logHabit()
//   fromTemplate()     → inline in addHabit / Phase 3 (UserHabit type dropped)
//
// Key difference: actions no longer mutate a slots array.
// They append to slotEvents, habitLogs, and freezeLedger arrays.
// Derived state (activeHabits, streak, etc.) is computed from these ledgers.
// ──────────────────────────────────────────────────────────────────────────────

// Re-export constants so existing imports don't immediately break during Phase 2.
// TODO [Phase 3] Remove these re-exports once all consumers import from @/types/app directly.
export { MAX_SLOTS, FREEZE_MILESTONE, MASTERY_MILESTONE } from '@/types/app'

export {} // keep module boundary
