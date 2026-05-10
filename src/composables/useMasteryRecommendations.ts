import { computed, watch } from "vue";
import { SECTIONS } from "@/data";
import { HABIT_TEMPLATES } from "@/data/habits";
import { getSortedSections } from "@/data/badge";
import { getSortedQuestions } from "@/data/insights";
import { useAssessmentStore } from "@/stores/assessment";
import { useMasteryStore } from "@/stores/mastery";
import { MAX_SLOTS } from "@/types/app";

/**
 * Manages the fixed set of up to 3 recommended habits derived from assessment
 * results. The set is computed once on assessment completion and persisted.
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
    // Build the same sorted question pipeline used by insights.
    const sortedSections = getSortedSections(assessmentStore.sectionResults);
    const sortedQuestions = getSortedQuestions(assessmentStore.answers, sortedSections);

    // Walk worst → best. For each question, find the first HABIT_TEMPLATE that
    // covers it, hasn't been picked yet, and isn't mastered. Take up to MAX_SLOTS.
    // Score 4 or 5 means the behaviour is already strong — skip for recommendations.
    const seen = new Set<string>();
    const matched: string[] = [];

    for (const { sectionId, questionId, score } of sortedQuestions) {
      if (score >= 4) continue;
      if (matched.length >= MAX_SLOTS) break;
      const template = HABIT_TEMPLATES.find(
        (h) =>
          h.covers.some((c) => c.sectionId === sectionId && c.questionId === questionId) &&
          !seen.has(h.id) &&
          !store.masteredTemplateIds.has(h.id) &&
          !store.masteredSlotTemplateIds.has(h.id),
      );
      if (template) {
        seen.add(template.id);
        matched.push(template.id);
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

  // Recommended habits the user has paused — still the right habits for them,
  // just not currently being worked on. Used to distinguish "paused" from
  // "genuinely no recommendations" in the UI.
  const pausedRecommendedIds = computed(() => {
    if (!isAssessmentComplete.value) return [];
    return assessmentStore.recommendedHabitIds.filter((id) => store.pausedTemplateIds.has(id));
  });

  return { isAssessmentComplete, recommendedIds, pausedRecommendedIds };
}
