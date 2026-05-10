import type { QuestionInsight, SectionMeta, SortedQuestion } from "@/types/app";
import { TRANSPORT_INSIGHTS } from "./transport";
import { FOOD_INSIGHTS } from "./food";
import { ENERGY_INSIGHTS } from "./energy";
import { CONSUMPTION_INSIGHTS } from "./consumption";
import { WATER_INSIGHTS } from "./water";
import { WASTE_INSIGHTS } from "./waste";
import { DIGITAL_INSIGHTS } from "./digital";

export const QUESTION_INSIGHTS: QuestionInsight[] = [
  ...TRANSPORT_INSIGHTS,
  ...FOOD_INSIGHTS,
  ...ENERGY_INSIGHTS,
  ...CONSUMPTION_INSIGHTS,
  ...WATER_INSIGHTS,
  ...WASTE_INSIGHTS,
  ...DIGITAL_INSIGHTS,
];

// ─── Step 2 — getSortedQuestions ─────────────────────────────────────────────

/**
 * Flatten all answers and sort them worst → best:
 *   primary   — section order from getSortedSections (weakest section first)
 *   secondary — score ascending within each section
 */
export function getSortedQuestions(
  answers: Partial<Record<string, Record<string, number>>>,
  sortedSections: Array<{ meta: SectionMeta; scaled: number }>,
): SortedQuestion[] {
  const sectionOrder = new Map(sortedSections.map((r, i) => [r.meta.id, i]));

  const all = Object.entries(answers).flatMap(([sectionId, qs]) =>
    Object.entries(qs ?? {}).map(([questionId, score]) => ({
      sectionId,
      questionId,
      score: score as 1 | 2 | 3 | 4 | 5,
    })),
  );

  return all.sort((a, b) => {
    const orderA = sectionOrder.get(a.sectionId) ?? Infinity;
    const orderB = sectionOrder.get(b.sectionId) ?? Infinity;
    if (orderA !== orderB) return orderA - orderB;
    return a.score - b.score;
  });
}

// ─── Step 4 — getInsightsForAssessment ───────────────────────────────────────

/**
 * Pick exactly 5 insights from the sorted question pool.
 *
 * Slots 1–4 — section-aware allocation:
 *   default (0 weak) → treat as broad, using sortedQuestions section order
 *   focused (1 weak) → 4 from section 1
 *   dual    (2 weak) → 2 from section 1, 2 from section 2
 *   broad   (3+ weak)→ 2 from section 1, 1 from section 2, 1 from section 3
 *
 * Slot 5 — search remaining pool strongest → weakest for score >= 4.
 *   Found     → that question (renders green in the view via score check)
 *   Not found → worst remaining question (renders default)
 *
 * No isAffirmation flag. The view checks score >= 4 for colour directly.
 */
export function getInsightsForAssessment(
  sortedQuestions: SortedQuestion[],
  weakSections: string[],
): QuestionInsight[] {
  if (sortedQuestions.length === 0) return [];

  const key = (q: SortedQuestion) => `${q.sectionId}::${q.questionId}`;

  // Derive section priority from sortedQuestions for the default (0 weak) case.
  // sortedQuestions is already weakest-section-first so unique section order is correct.
  const sectionOrder = [...new Set(sortedQuestions.map((q) => q.sectionId))];
  const prioritySections = weakSections.length > 0 ? weakSections : sectionOrder;

  const used = new Set<string>();

  function pickFromSection(sectionId: string, n: number): SortedQuestion[] {
    const result: SortedQuestion[] = [];
    for (const q of sortedQuestions) {
      if (result.length >= n) break;
      if (q.sectionId === sectionId && !used.has(key(q))) {
        result.push(q);
        used.add(key(q));
      }
    }
    return result;
  }

  const slots: SortedQuestion[] = [];

  if (weakSections.length === 1) {
    // focused: 4 from the one weak section
    slots.push(...pickFromSection(prioritySections[0]!, 4));
  } else if (weakSections.length === 2) {
    // dual: 2 + 2
    slots.push(...pickFromSection(prioritySections[0]!, 2));
    slots.push(...pickFromSection(prioritySections[1]!, 2));
  } else {
    // broad (3+ weak) or default (0 weak treated as broad): 2 + 1 + 1
    slots.push(...pickFromSection(prioritySections[0]!, 2));
    slots.push(...pickFromSection(prioritySections[1]!, 1));
    slots.push(...pickFromSection(prioritySections[2]!, 1));
  }

  // Slot 5: remaining pool, iterated strongest → weakest
  const remaining = sortedQuestions.filter((q) => !used.has(key(q))).reverse();
  const affirmation = remaining.find((q) => q.score >= 4) ?? remaining[remaining.length - 1];
  if (affirmation) slots.push(affirmation);

  // Resolve slots to QuestionInsight entries
  return slots.flatMap(({ sectionId, questionId, score }) => {
    const insight = QUESTION_INSIGHTS.find(
      (i) => i.sectionId === sectionId && i.questionId === questionId && i.score === score,
    );
    return insight ? [insight] : [];
  });
}
