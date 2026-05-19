// ─── useMasteryCheckin ────────────────────────────────────────────────────────
// Manages the check-in sheet state and display values for MasteryView.
//
// The sheet buffers answers locally and only flushes them to the store on close,
// so habit cards behind the sheet remain unchanged while the session is in progress.
// ─────────────────────────────────────────────────────────────────────────────

import { computed, ref, watch } from "vue";
import type { HabitLog } from "@/types/app";
import { useMasteryStore } from "@/stores/mastery";
import { todayISO } from "@/utils/habitDate";

export function useMasteryCheckin() {
  const store = useMasteryStore();

  // ── Sheet state ──────────────────────────────────────────────────────────

  const checkinOpen = ref(false);
  const checkinHabitId = ref<string | undefined>(undefined);

  // ── Display helpers ───────────────────────────────────────────────────────

  function resolveLogLabel(unlogged: number, total: number): string {
    if (unlogged === total) return "Log your habits";
    if (unlogged === 1) return "One left";
    return `${unlogged} left to log`;
  }

  /**
   * Returns the pre-loss streak value for a given template from lastReconcileEvents.
   * Only 'lost' events exist — protection is derived from freeze_ledger directly.
   */
  function displayLostStreak(templateId: string): number | undefined {
    return store.lastReconcileEvents.find((e) => e.templateId === templateId)?.streak;
  }

  // ── Computed display values ───────────────────────────────────────────────

  const showAllLogged = computed(() => store.allLoggedToday && !checkinOpen.value);

  const logLabel = computed(() =>
    resolveLogLabel(store.unloggedToday.length, store.activeHabits.length),
  );

  const displayMasteredToday = computed(() => {
    const today = todayISO();
    return (store.habitLogs as HabitLog[]).some(
      (l) => l.date === today && store.masteredSlotTemplateIds.has(l.template_id),
    );
  });

  // ── Handlers ─────────────────────────────────────────────────────────────

  /** Open the check-in sheet for a single habit (tapped directly from its card). */
  function handleLog(templateId: string): void {
    if (store.isLoggedToday(templateId)) return;
    checkinHabitId.value = templateId;
    checkinOpen.value = true;
  }

  /** Open the check-in sheet in log-all mode. */
  function handleLogAll(): void {
    checkinHabitId.value = undefined;
    checkinOpen.value = true;
  }

  function handleCheckinDone(): void {
    // Store is updated by the sheet on close. Live values take over automatically.
  }

  // When the user finishes logging all habits, clear the reconcile events so
  // the "streak lost" notices don't persist into the next session.
  watch(
    () => store.allLoggedToday,
    (allDone) => {
      if (allDone) store.clearReconcileEvents();
    },
  );

  return {
    checkinOpen,
    checkinHabitId,
    showAllLogged,
    logLabel,
    displayMasteredToday,
    displayLostStreak,
    handleLog,
    handleLogAll,
    handleCheckinDone,
  };
}
