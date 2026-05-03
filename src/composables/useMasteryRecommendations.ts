import { computed, watch } from "vue";
import { SECTIONS } from "@/data";
import { HABIT_TEMPLATES } from "@/data/habits";
import { getInsightsForAssessment } from "@/data/insights";
import { useAssessmentStore } from "@/stores/assessment";
import { useMasteryStore } from "@/stores/mastery";

/**
 * Manages the fixed set of up to 3 recommended habits derived from assessment
 * insights. The set is computed once on assessment completion and persisted.
 * Acting on a recommendation (add/pause) only hides it from the display list —
 * it never triggers a refill. Recomputes when answers change (reassessment) or
 * when a mastered habit is retired and a better candidate may be available.
 */
export function useMasteryRecommendations() {
  const assessmentStore = useAssessmentStore();
  const store = useMasteryStore();

  const isAssessmentComplete = computed(() =>
    SECTIONS.every((s) => assessmentStore.sectionResults.some((r) => r.meta.id === s.id)),
  );

  function recomputeRecommendations(): void {
    const insights = getInsightsForAssessment(assessmentStore.answers);
    const seen = new Set<string>();
    const matched: string[] = [];

    for (const insight of insights.filter((i) => !i.isAffirmation)) {
      if (matched.length >= 3) break;
      const h = HABIT_TEMPLATES.find(
        (h) =>
          h.covers.some(
            (c) => c.sectionId === insight.sectionId && c.questionId === insight.questionId,
          ) &&
          !seen.has(h.id) &&
          !store.masteredTemplateIds.has(h.id) &&
          !store.masteredSlotTemplateIds.has(h.id),
      );
      if (h) {
        seen.add(h.id);
        matched.push(h.id);
      }
    }

    assessmentStore.setRecommendedHabits(matched);
  }

  // Recompute on assessment completion, answer changes (reassessment),
  // mastery (a habit completes — next candidate should surface immediately),
  // or retirement (masteredArchive grows, slot fully freed).
  watch(
    [
      isAssessmentComplete,
      () => assessmentStore.answers,
      () => store.masteredHabits.length,
      () => store.masteredArchive.length,
    ],
    ([complete]) => {
      if (complete) recomputeRecommendations();
    },
    { immediate: true, deep: true },
  );

  // Display list — the fixed set minus anything already acted on.
  const recommendedIds = computed(() => {
    if (!isAssessmentComplete.value) return [];
    return assessmentStore.recommendedHabitIds.filter(
      (id) =>
        !store.activeTemplateIds.has(id) &&
        !store.pausedTemplateIds.has(id) &&
        !store.masteredTemplateIds.has(id) &&
        !store.masteredSlotTemplateIds.has(id),
    );
  });

  return { isAssessmentComplete, recommendedIds };
}
