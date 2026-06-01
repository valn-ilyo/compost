// Composable -- derives habit recommendations from assessment results and keeps them current
//
// ALGORITHM
// ---------
// After all 7 sections are completed, getSortedQuestions returns every answered
// question ordered worst -> best (weakest sections first, lowest score first within
// a section). We walk this list and pick the first unclaimed HABIT_TEMPLATE that:
//   - covers the question's (sectionId, questionId) pair
//   - has not already been picked in this pass
//   - is not mastered (no point recommending something already completed)
//   - has a score < 4 (score 4-5 means the behaviour is already strong; skip)
//
// The result is stored in assessmentStore.recommendedHabitIds and persisted.
// It is a fixed snapshot -- acting on a recommendation (add/pause) only hides it
// from the display list; it never triggers a refill or reorder.
//
// Recomputation triggers: assessment answers change (retake) or a habit is
// mastered/retired (the exclusion set changes).

import { computed, watch } from "vue";
import { useAssessmentStore } from "@/stores/assessment.store";
import { useMasteryStore } from "@/stores/mastery.store";
import { SECTIONS } from "@/data/registry";
import { HABIT_TEMPLATES } from "@/data/habits";
import { getSortedSections } from "@/data/badge";
import { getSortedQuestions } from "@/data/insights/insights";
import { MAX_SLOTS } from "@/types/app.types";

export function useMasteryRecommendations() {
  const assessmentStore = useAssessmentStore();
  const store = useMasteryStore();

  const isAssessmentComplete = computed(() =>
    SECTIONS.every((s) => assessmentStore.isCompleted(s.id)),
  );

  function recomputeRecommendations(): void {
    const sortedSections = getSortedSections(assessmentStore.sectionResults);
    const sortedQuestions = getSortedQuestions(assessmentStore.answers, sortedSections);
    const picked: string[] = [];

    for (const question of sortedQuestions) {
      if (picked.length >= MAX_SLOTS) break;
      if (question.score >= 4) continue; // behaviour already strong; no recommendation needed

      const candidate = HABIT_TEMPLATES.find(
        (t) =>
          t.covers.some(
            (c) => c.sectionId === question.sectionId && c.questionId === question.questionId,
          ) &&
          !picked.includes(t.id) &&
          !store.masteredTemplateIds.has(t.id),
      );

      if (candidate) picked.push(candidate.id);
    }

    assessmentStore.setRecommendedHabits(picked);
  }

  // Recompute when the assessment is complete, when answers change (retake),
  // or when the mastered set changes (retiring a habit opens up a recommendation slot).
  watch(
    () => [
      isAssessmentComplete.value,
      assessmentStore.answers,
      store.masteredHabits.length,
      store.masteredArchive.length,
    ],
    ([complete]) => {
      if (complete) recomputeRecommendations();
    },
    { immediate: true, deep: true },
  );

  // The fixed recommended set, filtered to exclude habits the user has already
  // acted on (added, paused, or mastered). Does not refill when a recommendation
  // is acted on; the snapshot is stable until a full reassessment.
  const recommendedIds = computed((): string[] => {
    if (!isAssessmentComplete.value) return [];
    return assessmentStore.recommendedHabitIds.filter(
      (id) =>
        !store.activeTemplateIds.has(id) &&
        !store.pausedTemplateIds.has(id) &&
        !store.masteredTemplateIds.has(id),
    );
  });

  // Recommended habits the user has paused; still the right recommendation but
  // not currently active. Used by HabitLibrary to distinguish "paused good habit"
  // from "genuinely no recommendations" in the UI.
  const pausedRecommendedIds = computed((): string[] =>
    assessmentStore.recommendedHabitIds.filter((id) => store.pausedTemplateIds.has(id)),
  );

  return { isAssessmentComplete, recommendedIds, pausedRecommendedIds };
}
