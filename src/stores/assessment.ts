import { defineStore } from "pinia";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SectionAnswers = Record<string, number>; // questionId → points (1–5)

import type { SectionMeta } from "../types/app.types";

import { SECTIONS } from "@/data/index";

// ─── Constants ────────────────────────────────────────────────────────────────

// Sum of all section scaledMax values:
// Transport (75) + Food (75) + Energy (50) + Consumption (40) +
// Waste (35) + Water (25) + Digital (25) = 325
const TOTAL_SCALED_MAX = 325;

// ─── Store ────────────────────────────────────────────────────────────────────

interface AssessmentState {
  answers: Partial<Record<string, SectionAnswers>>;
  completedAt: Partial<Record<string, number>>; // unix ms timestamp
  activeTab: string;
  /**
   * The fixed set of up to 3 habit template IDs recommended after the first
   * completed assessment. Computed once and persisted so that acting on a
   * recommendation (add / pause) never causes a replacement to appear.
   * Reset to [] by clearAll() if the user retakes the assessment from scratch.
   */
  recommendedHabitIds: string[];
}

export const useAssessmentStore = defineStore("assessment", {
  state: (): AssessmentState => ({
    answers: {},
    completedAt: {},
    activeTab: "checkin",
    recommendedHabitIds: [],
  }),

  getters: {
    // Is a given section completed?
    isCompleted:
      (state) =>
      (sectionId: string): boolean =>
        sectionId in state.answers && state.answers[sectionId] !== undefined,

    // Raw score for a section (sum of selected option points)
    rawScore:
      (state) =>
      (sectionId: string): number => {
        const sectionAnswers = state.answers[sectionId];
        if (!sectionAnswers) return 0;
        return Object.values(sectionAnswers).reduce((sum, v) => sum + v, 0);
      },

    // Scaled score for a section: (raw / maxRaw) × scaledMax  →  rounded
    scaledScore() {
      return (sectionId: string): number => {
        const meta = SECTIONS.find((s) => s.id === sectionId);
        if (!meta) return 0;
        const raw = this.rawScore(sectionId);
        return Math.round((raw / meta.maxRaw) * meta.scaledMax);
      };
    },

    // Overall score — only counts sections that have been answered.
    // achieved / outOf reflect raw weighted points.
    // normalized     → score out of 100 (fixed 325 denominator, never inflated)
    // normalizedOutOf → grows as sections are completed; reaches 100 when all done
    overallScore(): {
      achieved: number;
      outOf: number;
      normalized: number;
      normalizedOutOf: number;
    } {
      let achieved = 0;
      let outOf = 0;

      for (const section of SECTIONS) {
        if (this.isCompleted(section.id)) {
          achieved += this.scaledScore(section.id);
          outOf += section.scaledMax;
        }
      }

      return {
        achieved,
        outOf,
        normalized: Math.round((achieved / TOTAL_SCALED_MAX) * 100), // e.g. 74
        normalizedOutOf: Math.round((outOf / TOTAL_SCALED_MAX) * 100), // e.g. 45 → 100
      };
    },

    // Convenience: all answered sections with their computed scores
    sectionResults(): Array<{
      meta: SectionMeta;
      raw: number;
      scaled: number;
    }> {
      return SECTIONS.filter((s) => this.isCompleted(s.id)).map((meta) => ({
        meta,
        raw: this.rawScore(meta.id),
        scaled: this.scaledScore(meta.id),
      }));
    },
  },

  actions: {
    submitSection(sectionId: string, answers: SectionAnswers) {
      this.answers[sectionId] = { ...answers };
      this.completedAt[sectionId] = Date.now();
    },

    clearSection(sectionId: string) {
      delete this.answers[sectionId];
    },

    clearAll() {
      this.answers = {};
      this.completedAt = {};
      this.recommendedHabitIds = [];
    },

    /**
     * Stores the recommendation set. Called when the assessment is completed
     * or when a mastered habit is retired — always overwrites so that
     * reassessment or retirement can surface fresh candidates.
     */
    setRecommendedHabits(ids: string[]) {
      this.recommendedHabitIds = ids;
    },
  },

  persist: true,
});
