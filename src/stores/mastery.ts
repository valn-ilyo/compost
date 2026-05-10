import { defineStore } from "pinia";
import type { PersistenceOptions } from "pinia-plugin-persistedstate";
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
  pauseHabitInSlots,
  removeHabitFromSlots,
  resumeHabitInSlots,
  swapHabitInSlots,
} from "@/lib/habitLifecycle";
import { MAX_SLOTS, FREEZE_MILESTONE } from "@/types/app.types";
import { reconcile } from "@/lib/streakReconciler";
import { todayISO, yesterdayISO } from "@/lib/habitDate";
import { useSyncStore } from "@/stores/sync";
import { useProfileStore } from "@/stores/profile";
import { hydrateFromSupabase as _hydrateFromSupabase } from "@/lib/masteryHydration";

// ─── Constants ────────────────────────────────────────────────────────────────

const FREEZE_CAP = MAX_SLOTS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build the habit_slots upsert payload from a UserHabit. */
function slotPayload(userId: string, habit: UserHabit): Record<string, unknown> {
  return {
    user_id: userId,
    template_id: habit.templateId,
    streak: habit.streak,
    last_logged_date: habit.lastLoggedDate,
    is_paused: habit.isPaused,
    is_mastered: habit.isMastered,
    freeze_used: habit.freezeUsed,
    updated_at: new Date().toISOString(),
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMasteryStore = defineStore(
  "mastery",
  () => {
    // ── State ──────────────────────────────────────────────────────────────────

    const slots = ref<UserHabit[]>([]);
    const freezeCount = ref(0);
    const masteredArchive = ref<MasteredArchiveEntry[]>([]);

    // Not persisted — session-scoped. reconcileStreaks() regenerates on next open.
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

    const masteredSlotTemplateIds = computed(
      () => new Set(masteredHabits.value.map((h) => h.templateId)),
    );

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

      const userId = useProfileStore().profile?.user_id;
      if (!userId) return;

      const habit = slots.value.find((h) => h.templateId === template.id && !h.isPaused);
      if (!habit) return;

      useSyncStore().enqueue({
        id: `habit_slots:${userId}:${template.id}`,
        table: "habit_slots",
        operation: "upsert",
        payload: slotPayload(userId, habit),
        enqueuedAt: Date.now(),
      });
    }

    function removeHabit(id: string): void {
      const habit = slots.value.find((h) => h.id === id);
      slots.value = removeHabitFromSlots(slots.value, id);
      lastReconcileEvents.value = lastReconcileEvents.value.filter((e) => e.habitId !== id);

      const userId = useProfileStore().profile?.user_id;
      if (!userId || !habit) return;

      useSyncStore().enqueue({
        id: `habit_slots:${userId}:${habit.templateId}`,
        table: "habit_slots",
        operation: "delete",
        payload: { user_id: userId, template_id: habit.templateId },
        enqueuedAt: Date.now(),
      });
    }

    function pauseHabit(id: string): void {
      // Capture before mutation — streak-0 path removes the habit from slots.
      const habit = slots.value.find((h) => h.id === id);
      const result = pauseHabitInSlots(slots.value, id);
      if (result !== null) slots.value = result;

      if (habit?.streak === 0) {
        lastReconcileEvents.value = lastReconcileEvents.value.filter((e) => e.habitId !== id);
      }

      const userId = useProfileStore().profile?.user_id;
      if (!userId || !habit) return;

      if (habit.streak === 0) {
        // Removed outright → delete from Supabase
        useSyncStore().enqueue({
          id: `habit_slots:${userId}:${habit.templateId}`,
          table: "habit_slots",
          operation: "delete",
          payload: { user_id: userId, template_id: habit.templateId },
          enqueuedAt: Date.now(),
        });
      } else {
        useSyncStore().enqueue({
          id: `habit_slots:${userId}:${habit.templateId}`,
          table: "habit_slots",
          operation: "upsert",
          payload: slotPayload(userId, { ...habit, isPaused: true }),
          enqueuedAt: Date.now(),
        });
      }
    }

    function resumeHabit(id: string): void {
      // Guard: resuming a paused slot must not push active+mastered past MAX_SLOTS.
      // Mirrors the same invariant enforced in addHabit — the composable layer
      // also checks this, but the store is the authoritative enforcer.
      if (usedSlots.value >= MAX_SLOTS) return;
      resumeHabitInSlots(slots.value, id, todayISO(), yesterdayISO());

      const userId = useProfileStore().profile?.user_id;
      if (!userId) return;

      const habit = slots.value.find((h) => h.id === id);
      if (!habit) return;

      useSyncStore().enqueue({
        id: `habit_slots:${userId}:${habit.templateId}`,
        table: "habit_slots",
        operation: "upsert",
        payload: slotPayload(userId, habit),
        enqueuedAt: Date.now(),
      });
    }

    function swapHabit(removeId: string, template: HabitTemplate): void {
      if (activeTemplateIds.value.has(template.id)) return;
      // Capture outgoing habit before any mutation.
      const oldHabit = slots.value.find((h) => h.id === removeId);
      lastReconcileEvents.value = lastReconcileEvents.value.filter((e) => e.habitId !== removeId);
      swapHabitInSlots(slots.value, removeId, template, todayISO(), yesterdayISO());

      const userId = useProfileStore().profile?.user_id;
      if (!userId) return;

      const sync = useSyncStore();

      // Enqueue old habit
      if (oldHabit) {
        if (oldHabit.streak === 0) {
          sync.enqueue({
            id: `habit_slots:${userId}:${oldHabit.templateId}`,
            table: "habit_slots",
            operation: "delete",
            payload: { user_id: userId, template_id: oldHabit.templateId },
            enqueuedAt: Date.now(),
          });
        } else {
          const stillInSlots = slots.value.find((h) => h.id === removeId);
          sync.enqueue({
            id: `habit_slots:${userId}:${oldHabit.templateId}`,
            table: "habit_slots",
            operation: "upsert",
            payload: slotPayload(userId, stillInSlots ?? { ...oldHabit, isPaused: true }),
            enqueuedAt: Date.now(),
          });
        }
      }

      const newHabit = slots.value.find((h) => h.templateId === template.id && !h.isPaused);
      if (newHabit) {
        sync.enqueue({
          id: `habit_slots:${userId}:${template.id}`,
          table: "habit_slots",
          operation: "upsert",
          payload: slotPayload(userId, newHabit),
          enqueuedAt: Date.now(),
        });
      }
    }

    function logHabit(id: string, didIt: boolean): void {
      const today = todayISO();

      lastReconcileEvents.value = lastReconcileEvents.value.filter((e) => e.habitId !== id);

      const prevFreezeCount = freezeCount.value;

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
        // Unconditional — mastery always grants a freeze, even past the cap (overflow).
        // Normal 22/44-day milestones are already blocked by the freezeCount < freezeCap
        // guard inside logHabitInSlots, so overflow can only be reached via mastery.
        freezeCount.value++;
      } else if (result.freezeEarned) {
        freezeCount.value++;
      }

      const userId = useProfileStore().profile?.user_id;
      if (!userId) return;

      const sync = useSyncStore();
      const habit = slots.value.find((h) => h.id === id);

      if (habit) {
        sync.enqueue({
          id: `habit_slots:${userId}:${habit.templateId}`,
          table: "habit_slots",
          operation: "upsert",
          payload: slotPayload(userId, habit),
          enqueuedAt: Date.now(),
        });
      }

      if (freezeCount.value !== prevFreezeCount) {
        sync.enqueue({
          id: `mastery_state:${userId}`,
          table: "mastery_state",
          operation: "upsert",
          payload: {
            user_id: userId,
            freeze_count: freezeCount.value,
            updated_at: new Date().toISOString(),
          },
          enqueuedAt: Date.now(),
        });
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

      const userId = useProfileStore().profile?.user_id;
      if (!userId) return;

      const sync = useSyncStore();

      sync.enqueue({
        id: `habit_slots:${userId}:${habit.templateId}`,
        table: "habit_slots",
        operation: "delete",
        payload: { user_id: userId, template_id: habit.templateId },
        enqueuedAt: Date.now(),
      });

      sync.enqueue({
        id: `mastered_archive:${userId}:${habit.templateId}`,
        table: "mastered_archive",
        operation: "upsert",
        payload: {
          user_id: userId,
          template_id: habit.templateId,
          retired_at: new Date().toISOString(),
        },
        enqueuedAt: Date.now(),
      });
    }

    function reconcileStreaks(): void {
      const prevFreezeCount = freezeCount.value;

      const { events, newFreezeCount } = reconcile(
        slots.value,
        freezeCount.value,
        lastReconcileEvents.value,
        todayISO(),
        yesterdayISO(),
      );
      freezeCount.value = newFreezeCount;
      lastReconcileEvents.value = events;

      const userId = useProfileStore().profile?.user_id;
      if (!userId) return;

      const sync = useSyncStore();

      const affectedIds = new Set(events.map((e) => e.habitId));
      for (const habit of slots.value) {
        if (affectedIds.has(habit.id)) {
          sync.enqueue({
            id: `habit_slots:${userId}:${habit.templateId}`,
            table: "habit_slots",
            operation: "upsert",
            payload: slotPayload(userId, habit),
            enqueuedAt: Date.now(),
          });
        }
      }

      if (newFreezeCount !== prevFreezeCount) {
        sync.enqueue({
          id: `mastery_state:${userId}`,
          table: "mastery_state",
          operation: "upsert",
          payload: {
            user_id: userId,
            freeze_count: newFreezeCount,
            updated_at: new Date().toISOString(),
          },
          enqueuedAt: Date.now(),
        });
      }
    }

    function clearReconcileEvents(): void {
      lastReconcileEvents.value = [];
    }

    async function hydrateFromSupabase(userId: string): Promise<void> {
      await _hydrateFromSupabase(userId, slots, freezeCount, masteredArchive);
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
      hydrateFromSupabase,
    };
  },
  {
    persist: {
      pick: ["slots", "freezeCount", "masteredArchive"],
    } as PersistenceOptions,
  },
);
