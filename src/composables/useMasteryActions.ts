// Composable -- slot management actions (add, resume, pause, remove, swap, retire) for MasteryView
//
// The swap sheet state lives here because it spans the gap between the user
// tapping "add" on a full-slots screen and confirming which habit to replace.

import { ref } from "vue";
import type { HabitTemplate } from "@/types/app.types";
import { useMasteryStore } from "@/stores/mastery.store";
import { useNotifier } from "@/composables/useNotifier";
import { HABIT_TEMPLATES } from "@/data/habits";

export function useMasteryActions() {
  const store = useMasteryStore();
  const { notify } = useNotifier();

  // Swap sheet state -- open when the user tries to add or resume a habit
  // but all MAX_SLOTS slots are occupied.
  //
  // pendingAction distinguishes the two cases so handleSwap dispatches
  // correctly after the user picks which habit to evict:
  //   'add'    -> the pending habit has no slot yet; use addHabit
  //   'resume' -> the pending habit already has a paused slot; use resumeHabit
  const swapOpen = ref(false);
  const pendingTemplate = ref<HabitTemplate | null>(null);
  const pendingAction = ref<"add" | "resume">("add");

  // If all slots are full, open the swap sheet so the user can choose which
  // habit to replace.
  function handleAdd(templateId: string): void {
    const template = HABIT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    if (store.usedSlots >= store.MAX_SLOTS) {
      pendingTemplate.value = template;
      pendingAction.value = "add";
      swapOpen.value = true;
    } else {
      store.addHabit(template);
    }
  }

  // Same slot-full guard as add; if resuming would exceed MAX_SLOTS, route
  // through the swap sheet.
  function handleResume(templateId: string): void {
    if (store.usedSlots >= store.MAX_SLOTS) {
      const template = HABIT_TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        pendingTemplate.value = template;
        pendingAction.value = "resume";
        swapOpen.value = true;
      }
    } else {
      store.resumeHabit(templateId);
      notify({ message: "Streak restored", color: "success" });
    }
  }

  // The streak is preserved; the streak walker treats pause/resume date ranges
  // as transparent gaps.
  function handlePause(templateId: string): void {
    const s = store.streak(templateId);
    store.pauseHabit(templateId);
    if (s > 0) notify({ message: "Streak saved", color: "info" });
  }

  function handleRemove(templateId: string): void {
    store.removeHabit(templateId);
  }

  // Remove the selected habit and add the pending one.
  function handleSwap(removeTemplateId: string): void {
    if (!pendingTemplate.value) return;

    const removedStreak = store.streak(removeTemplateId);
    const incoming = pendingTemplate.value;
    const action = pendingAction.value;

    // Always evict the chosen outgoing habit first (pause if it has a streak,
    // otherwise remove for a clean slate).
    if (removedStreak > 0) {
      store.pauseHabit(removeTemplateId);
    } else {
      store.removeHabit(removeTemplateId);
    }

    // Dispatch the correct action for the incoming habit:
    //   'add'    -> new habit, needs a fresh slot row via slot_add RPC
    //   'resume' -> already has a paused slot row; slot_resume flips it active
    if (action === "resume") {
      store.resumeHabit(incoming.id);
      notify({ message: "Streak restored", color: "success" });
    } else {
      store.addHabit(incoming);
    }

    if (removedStreak > 0) notify({ message: "Streak saved", color: "info" });

    pendingTemplate.value = null;
    pendingAction.value = "add";
    swapOpen.value = false;
  }

  function handleRetire(templateId: string): void {
    store.retireHabit(templateId);
    notify({ message: "Retired to library", color: "success" });
  }

  return {
    swapOpen,
    pendingTemplate,
    pendingAction,
    handleAdd,
    handleResume,
    handlePause,
    handleRemove,
    handleSwap,
    handleRetire,
  };
}
