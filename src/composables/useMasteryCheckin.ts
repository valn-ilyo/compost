import { computed, ref, watch } from "vue";
import { useMasteryStore } from "@/stores/mastery";
import type { UserHabit } from "@/types/app.types";

/**
 * Manages the check-in sheet state and the UI snapshot taken when the user
 * taps "Log all habits". The snapshot freezes habit display state at the
 * moment the sheet opens, so cards don't visually update mid-session while
 * the user is logging one by one.
 */
export function useMasteryCheckin() {
  const store = useMasteryStore();

  // ── Sheet state ─────────────────────────────────────────────────────────────

  const checkinOpen = ref(false);
  const checkinHabitId = ref<string | undefined>(undefined);
  const isLogAll = ref(false);

  // ── Snapshot ────────────────────────────────────────────────────────────────

  const frozenHabits = ref<Map<string, UserHabit>>(new Map());
  const frozenLostStreakMap = ref<Map<string, number>>(new Map());
  const frozenLogLabel = ref<string | null>(null);
  const frozenFreezeCount = ref(0);
  const frozenFreezeCap = ref(0);
  const frozenDaysToNextFreeze = ref<number | null>(null);
  const frozenAnyFreezeUsed = ref(false);

  const lostStreakMap = computed(
    () =>
      new Map(
        store.lastReconcileEvents
          .filter((e) => e.type === "lost")
          .map((e) => [e.habitId, e.streak]),
      ),
  );

  function resolveLogLabel(unlogged: number, total: number): string {
    if (unlogged === total) return "Log your habits";
    if (unlogged === 1) return "One left";
    return "Two left to log";
  }

  function snapshotHabits(): void {
    frozenHabits.value = new Map(store.activeHabits.map((h) => [h.id, { ...h }]));
    frozenLostStreakMap.value = new Map(
      store.lastReconcileEvents
        .filter((e) => e.type === "lost")
        .map((e) => [e.habitId, e.streak]),
    );
    frozenLogLabel.value = resolveLogLabel(store.unloggedToday.length, store.activeHabits.length);
    frozenFreezeCount.value = store.freezeCount;
    frozenFreezeCap.value = store.freezeCap;
    frozenDaysToNextFreeze.value = store.daysToNextFreeze;
    frozenAnyFreezeUsed.value = store.activeHabits.some((h) => h.freezeUsed);
  }

  // ── Display helpers ─────────────────────────────────────────────────────────

  /** Returns the frozen snapshot of a habit during log-all, else live. */
  function displayHabit(habit: UserHabit): UserHabit {
    return isLogAll.value && checkinOpen.value
      ? (frozenHabits.value.get(habit.id) ?? habit)
      : habit;
  }

  /** Returns the frozen lost streak during log-all, else live. */
  function displayLostStreak(habitId: string): number | undefined {
    return isLogAll.value && checkinOpen.value
      ? frozenLostStreakMap.value.get(habitId)
      : lostStreakMap.value.get(habitId);
  }

  // ── Computed display values ─────────────────────────────────────────────────

  const showAllLogged = computed(() => store.allLoggedToday && !checkinOpen.value);

  const logLabel = computed(() => {
    if (isLogAll.value && checkinOpen.value && frozenLogLabel.value !== null)
      return frozenLogLabel.value;
    return resolveLogLabel(store.unloggedToday.length, store.activeHabits.length);
  });

  const displayFreezeCount = computed(() =>
    isLogAll.value && checkinOpen.value ? frozenFreezeCount.value : store.freezeCount,
  );
  const displayFreezeCap = computed(() =>
    isLogAll.value && checkinOpen.value ? frozenFreezeCap.value : store.freezeCap,
  );
  const displayDaysToNextFreeze = computed(() =>
    isLogAll.value && checkinOpen.value ? frozenDaysToNextFreeze.value : store.daysToNextFreeze,
  );
  const displayAnyFreezeUsed = computed(() =>
    isLogAll.value && checkinOpen.value
      ? frozenAnyFreezeUsed.value
      : store.activeHabits.some((h) => h.freezeUsed),
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleLog(habitId: string): void {
    isLogAll.value = false;
    checkinHabitId.value = habitId;
    checkinOpen.value = true;
  }

  function handleLogAll(): void {
    isLogAll.value = true;
    snapshotHabits();
    checkinHabitId.value = undefined;
    checkinOpen.value = true;
  }

  function handleCheckinDone(): void {
    // no-op: sheet closes and habit cards update to checked state visually.
  }

  // Clear reconcile events once all habits are logged for the day.
  watch(
    () => store.allLoggedToday,
    (allDone) => { if (allDone) store.clearReconcileEvents(); },
  );

  return {
    checkinOpen,
    checkinHabitId,
    showAllLogged,
    logLabel,
    displayFreezeCount,
    displayFreezeCap,
    displayDaysToNextFreeze,
    displayAnyFreezeUsed,
    displayHabit,
    displayLostStreak,
    handleLog,
    handleLogAll,
    handleCheckinDone,
  };
}
