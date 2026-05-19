// ─── useMasteryActions ────────────────────────────────────────────────────────
// Encapsulates all slot management actions surfaced in MasteryView:
// add, resume, pause, remove, swap, and retire.
//
// The swap sheet state lives here because it spans the gap between the user
// tapping "add" on a full-slots screen and confirming which habit to replace.
// ─────────────────────────────────────────────────────────────────────────────

import { ref } from 'vue'
import type { HabitTemplate } from '@/types/app'
import { useMasteryStore } from '@/stores/mastery'
import { useNotifier }     from '@/composables/useNotifier'
import { HABIT_TEMPLATES } from '@/data/habits'

export function useMasteryActions() {
  const store = useMasteryStore()
  const { notify } = useNotifier()

  // Swap sheet state — open when the user tries to add or resume a habit
  // but all MAX_SLOTS slots are occupied.
  const swapOpen        = ref(false)
  const pendingTemplate = ref<HabitTemplate | null>(null)

  /**
   * Add a habit by template id. If all slots are full, open the swap sheet
   * so the user can choose which habit to replace.
   */
  function handleAdd(templateId: string): void {
    const template = HABIT_TEMPLATES.find(t => t.id === templateId)
    if (!template) return
    if (store.usedSlots >= store.MAX_SLOTS) {
      pendingTemplate.value = template
      swapOpen.value = true
    } else {
      store.addHabit(template)
    }
  }

  /**
   * Resume a paused habit. Same slot-full guard as add — if resuming would
   * exceed MAX_SLOTS, route through the swap sheet.
   */
  function handleResume(templateId: string): void {
    if (store.usedSlots >= store.MAX_SLOTS) {
      const template = HABIT_TEMPLATES.find(t => t.id === templateId)
      if (template) {
        pendingTemplate.value = template
        swapOpen.value = true
      }
    } else {
      store.resumeHabit(templateId)
      notify({ message: 'Streak restored', color: 'success' })
    }
  }

  /**
   * Pause an active habit. The streak is preserved — the streak walker
   * treats pause/resumed date ranges as transparent gaps.
   */
  function handlePause(templateId: string): void {
    const s = store.streak(templateId)
    store.pauseHabit(templateId)
    if (s > 0) notify({ message: 'Streak saved', color: 'info' })
  }

  /** Remove a habit from its slot entirely. */
  function handleRemove(templateId: string): void {
    store.removeHabit(templateId)
  }

  /**
   * Confirm the swap: remove the selected habit and add the pending one.
   * Called from the swap sheet's confirm button.
   */
  function handleSwap(removeTemplateId: string): void {
    if (!pendingTemplate.value) return
    const removedStreak = store.streak(removeTemplateId)
    store.swapHabit(removeTemplateId, pendingTemplate.value)
    if (removedStreak > 0) notify({ message: 'Streak saved', color: 'info' })
    pendingTemplate.value = null
    swapOpen.value = false
  }

  /** Retire a mastered habit into the permanent archive and free its slot. */
  function handleRetire(templateId: string): void {
    store.retireHabit(templateId)
    notify({ message: 'Retired to library', color: 'success' })
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
  }
}
