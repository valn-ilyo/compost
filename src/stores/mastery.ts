import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type {
  HabitTemplate,
  MasteredArchiveEntry,
  ReconcileEvent,
  UserHabit,
} from "@/types/app.types";
import {
  addHabitToSlots,
  logHabitInSlots,
  MAX_SLOTS,
  FREEZE_MILESTONE,
  pauseHabitInSlots,
  removeHabitFromSlots,
  resumeHabitInSlots,
  swapHabitInSlots,
} from "@/lib/habitLifecycle";
import { reconcile } from "@/lib/streakReconciler";
import { todayISO, yesterdayISO } from "@/lib/habitDate";

// ─── Constants ────────────────────────────────────────────────────────────────

const FREEZE_CAP = MAX_SLOTS; // one freeze token per active slot max

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMasteryStore = defineStore(
  "mastery",
  () => {
    // ── State ──────────────────────────────────────────────────────────────────

    const slots = ref<UserHabit[]>([]);
    const freezeCount = ref(0);
    const masteredArchive = ref<MasteredArchiveEntry[]>([]);

    /**
     * Events produced by the most recent reconcileStreaks call.
     * Persisted so they survive a page refresh and remain visible on next open.
     * Cleared per-habit when that habit is logged, and fully cleared by
     * clearReconcileEvents() once all habits are logged today.
     */
    const lastReconcileEvents = ref<ReconcileEvent[]>([]);

    // ── Derived ────────────────────────────────────────────────────────────────

    const activeHabits = computed(() => slots.value.filter((h) => !h.isPaused && !h.isMastered));
    const pausedHabits = computed(() => slots.value.filter((h) => h.isPaused));
    const masteredHabits = computed(() => slots.value.filter((h) => h.isMastered));

    const activeTemplateIds = computed(() => new Set(activeHabits.value.map((h) => h.templateId)));
    const pausedTemplateIds = computed(() => new Set(pausedHabits.value.map((h) => h.templateId)));
    const masteredTemplateIds = computed(
      () => new Set(masteredArchive.value.map((e) => e.templateId)),
    );

    /** Template IDs of habits that are mastered but not yet retired (still in slots). */
    const masteredSlotTemplateIds = computed(
      () => new Set(masteredHabits.value.map((h) => h.templateId)),
    );

    /** Total slots occupied — active + mastered (pre-retirement). */
    const usedSlots = computed(() => activeHabits.value.length + masteredHabits.value.length);

    const freezeCap = computed(() => FREEZE_CAP);

    const daysToNextFreeze = computed(() => {
      if (activeHabits.value.length === 0) return null;
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

    // ── Actions ────────────────────────────────────────────────────────────────

    function addHabit(template: HabitTemplate): void {
      addHabitToSlots(
        slots.value,
        template,
        usedSlots.value,
        activeTemplateIds.value,
        pausedTemplateIds.value,
      );
    }

    function removeHabit(id: string): void {
      slots.value = removeHabitFromSlots(slots.value, id);
      lastReconcileEvents.value = lastReconcileEvents.value.filter((e) => e.habitId !== id);
    }

    function pauseHabit(id: string): void {
      const result = pauseHabitInSlots(slots.value, id);
      if (result !== null) slots.value = result; // zero-streak removal path
    }

    function resumeHabit(id: string): void {
      resumeHabitInSlots(slots.value, id, todayISO(), yesterdayISO());
    }

    function swapHabit(removeId: string, template: HabitTemplate): void {
      lastReconcileEvents.value = lastReconcileEvents.value.filter((e) => e.habitId !== removeId);
      swapHabitInSlots(slots.value, removeId, template, todayISO(), yesterdayISO());
    }

    function logHabit(id: string, didIt: boolean): void {
      const today = todayISO();

      // Clear this habit's reconcile event immediately on log.
      lastReconcileEvents.value = lastReconcileEvents.value.filter((e) => e.habitId !== id);

      const result = logHabitInSlots(
        slots.value,
        id,
        didIt,
        today,
        yesterdayISO(),
        freezeCount.value,
        freezeCap.value,
      );

      if (!result) return;

      if (result.mastered) {
        // Unconditional freeze grant for mastery — allowed to exceed cap.
        freezeCount.value++;
      } else if (result.freezeEarned) {
        freezeCount.value++;
      }
    }

    function retireHabit(id: string): void {
      const habit = slots.value.find((h) => h.id === id);
      if (!habit || !habit.isMastered) return;
      masteredArchive.value.push({
        templateId: habit.templateId,
        name: habit.name,
        icon: habit.icon,
      });
      slots.value = slots.value.filter((h) => h.id !== id);
    }

    function reconcileStreaks(): void {
      const { events, newFreezeCount } = reconcile(
        slots.value,
        freezeCount.value,
        lastReconcileEvents.value,
        todayISO(),
        yesterdayISO(),
      );
      freezeCount.value = newFreezeCount;
      lastReconcileEvents.value = events;
    }

    function clearReconcileEvents(): void {
      lastReconcileEvents.value = [];
    }

    return {
      // state
      slots,
      freezeCount,
      lastReconcileEvents,
      masteredArchive,
      // derived
      activeHabits,
      pausedHabits,
      masteredHabits,
      activeTemplateIds,
      pausedTemplateIds,
      masteredTemplateIds,
      masteredSlotTemplateIds,
      usedSlots,
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
      retireHabit,
      reconcileStreaks,
      clearReconcileEvents,
    };
  },
  { persist: true },
);
