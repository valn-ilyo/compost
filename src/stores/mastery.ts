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
  pauseHabitInSlots,
  removeHabitFromSlots,
  resumeHabitInSlots,
  swapHabitInSlots,
} from "@/lib/habitLifecycle";
import { MAX_SLOTS, FREEZE_MILESTONE } from "@/types/app.types";
import { reconcile } from "@/lib/streakReconciler";
import { todayISO, yesterdayISO } from "@/lib/habitDate";
import { supabase } from "@/lib/supabaseClient";
import { HABIT_TEMPLATES } from "@/data/habits";
import { useSyncStore } from "@/stores/sync";
import { useProfileStore } from "@/stores/profile";

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
        // Paused in place — upsert with is_paused: true
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
          // Streak > 0 — paused in place by swapHabitInSlots
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

      // Enqueue new (incoming) habit
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

      // Enqueue only habits that were touched by this reconcile pass
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

    /**
     * Pull habit slots, mastery state, and mastered archive from Supabase.
     * Local wins: remote slots are skipped if a local slot with the same
     * templateId already exists (the queue may have newer in-flight writes).
     * freezeCount is only taken from remote if local slots are all empty
     * (i.e. fresh device with no local data yet).
     * Throws on network or Supabase errors so the hydration caller can surface
     * the error state.
     */
    async function hydrateFromSupabase(userId: string) {
      const [slotsRes, stateRes, archiveRes] = await Promise.all([
        supabase.from("habit_slots").select("*").eq("user_id", userId),
        supabase.from("mastery_state").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("mastered_archive").select("*").eq("user_id", userId),
      ]);

      if (slotsRes.error) throw slotsRes.error;
      if (stateRes.error) throw stateRes.error;
      if (archiveRes.error) throw archiveRes.error;

      // ── Habit slots ──────────────────────────────────────────────────────────

      // Capture before the loop — the loop pushes remote rows into slots, so
      // checking slots.value.length === 0 *after* would always be false when
      // the user has remote data. We need the pre-hydration count to detect a
      // "fresh device with no local data" scenario for freeze count below.
      const localSlotCount = slots.value.length;

      const localTemplateIds = new Set(slots.value.map((h) => h.templateId));

      for (const row of slotsRes.data ?? []) {
        if (localTemplateIds.has(row.template_id)) continue;

        const template = HABIT_TEMPLATES.find((t) => t.id === row.template_id);
        if (!template) continue; // template was removed from code — skip

        slots.value.push({
          id: String(Date.now() + Math.random()), // stable only for this session
          templateId: row.template_id,
          name: template.name,
          icon: template.icon,
          iconOutline: template.iconOutline,
          sectionId: template.sectionId,
          prompt: template.prompt,
          when: template.when,
          instruction: template.instruction,
          streak: row.streak,
          lastLoggedDate: row.last_logged_date,
          isPaused: row.is_paused,
          isMastered: row.is_mastered,
          freezeUsed: row.freeze_used,
        });
      }

      // ── Mastery state (freeze count) ─────────────────────────────────────────
      // Only take from remote if local is a clean slate — no slots at all before
      // this hydration run. If the user had local data, local wins.

      if (stateRes.data && localSlotCount === 0) {
        freezeCount.value = stateRes.data.freeze_count;
      }

      // ── Mastered archive ─────────────────────────────────────────────────────

      const localArchivedIds = new Set(masteredArchive.value.map((e) => e.templateId));

      for (const row of archiveRes.data ?? []) {
        if (localArchivedIds.has(row.template_id)) continue;

        const template = HABIT_TEMPLATES.find((t) => t.id === row.template_id);
        if (!template) continue;

        masteredArchive.value.push({
          templateId: row.template_id,
          name: template.name,
          icon: template.icon,
        });
      }
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
  { persist: true },
);
