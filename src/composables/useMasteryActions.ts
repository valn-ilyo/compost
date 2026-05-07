import { ref } from "vue";
import { HABIT_TEMPLATES } from "@/data/habits";
import { useNotifier } from "@/composables/useNotifier";
import { useMasteryStore } from "@/stores/mastery";
import { MAX_SLOTS } from "@/types/app.types";
import type { HabitTemplate } from "@/types/app.types";

/**
 * Encapsulates all slot management actions surfaced in MasteryView:
 * add, resume, pause, remove, swap, and retire.
 *
 * Swap sheet state lives here because it is solely driven by these actions
 * and has no reason to live in the view or the store.
 */
export function useMasteryActions() {
  const store = useMasteryStore();
  const { notify } = useNotifier();

  const swapOpen = ref(false);
  const pendingTemplate = ref<HabitTemplate | null>(null);

  function handleAdd(templateId: string): void {
    const template = HABIT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    if (store.usedSlots >= MAX_SLOTS) {
      pendingTemplate.value = template;
      swapOpen.value = true;
    } else {
      store.addHabit(template);
    }
  }

  function handleResume(habitId: string): void {
    const habit = store.pausedHabits.find((h) => h.id === habitId);
    if (!habit) return;
    if (store.usedSlots >= MAX_SLOTS) {
      const template = HABIT_TEMPLATES.find((t) => t.id === habit.templateId);
      if (!template) return;
      pendingTemplate.value = template;
      swapOpen.value = true;
    } else {
      store.resumeHabit(habitId);
      notify({ message: `"${habit.name}" is back. Streak restored.`, color: "info" });
    }
  }

  function handlePause(id: string): void {
    const habit = store.activeHabits.find((h) => h.id === id);
    if (!habit) return;
    store.pauseHabit(id);
    if (habit.streak > 0) {
      notify({ message: `"${habit.name}" paused. Streak saved.`, color: "info" });
    }
  }

  function handleRemove(id: string): void {
    store.removeHabit(id);
  }

  function handleSwap(removeId: string): void {
    if (!pendingTemplate.value) return;
    const removed = store.activeHabits.find((h) => h.id === removeId);
    store.swapHabit(removeId, pendingTemplate.value);
    if (removed && removed.streak > 0) {
      notify({ message: `"${removed.name}" streak saved.`, color: "info" });
    }
    pendingTemplate.value = null;
    swapOpen.value = false;
  }

  function handleRetire(id: string): void {
    const habit = store.masteredHabits.find((h) => h.id === id);
    store.retireHabit(id);
    // Recommendation recompute is handled reactively by useMasteryRecommendations
    // watching store.masteredArchive.length — no explicit call needed here.
    if (habit) notify({ message: `"${habit.name}" retired to your library.`, color: "success" });
  }

  return {
    swapOpen,
    pendingTemplate,
    handleAdd,
    handleResume,
    handlePause,
    handleRemove,
    handleSwap,
    handleRetire,
  };
}
