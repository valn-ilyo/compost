import { defineStore } from "pinia";

import type { SectionMeta, SectionAnswers, AssessmentState } from "../types/app.types";
export type { SectionAnswers }; // re-export so existing imports from this module keep working

import { SECTIONS } from "@/data/index";
import { useSyncStore } from "@/stores/sync";
import { useProfileStore } from "@/stores/profile";
import { supabase } from "@/lib/supabaseClient";

// ─── Constants ────────────────────────────────────────────────────────────────

// Sum of all section scaledMax values:
// Transport (75) + Food (75) + Energy (50) + Consumption (40) +
// Waste (35) + Water (25) + Digital (25) = 325
const TOTAL_SCALED_MAX = 325;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAssessmentStore = defineStore("assessment", {
  state: (): AssessmentState => ({
    answers: {},
    completedAt: {},
    activeTab: "checkin",
    recommendedHabitIds: [],
  }),

  getters: {
    isCompleted:
      (state) =>
      (sectionId: string): boolean =>
        sectionId in state.answers && state.answers[sectionId] !== undefined,

    rawScore:
      (state) =>
      (sectionId: string): number => {
        const sectionAnswers = state.answers[sectionId];
        if (!sectionAnswers) return 0;
        return Object.values(sectionAnswers).reduce((sum, v) => sum + v, 0);
      },

    scaledScore() {
      return (sectionId: string): number => {
        const meta = SECTIONS.find((s) => s.id === sectionId);
        if (!meta) return 0;
        const raw = this.rawScore(sectionId);
        return Math.round((raw / meta.maxRaw) * meta.scaledMax);
      };
    },

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
        normalized: Math.round((achieved / TOTAL_SCALED_MAX) * 100),
        normalizedOutOf: Math.round((outOf / TOTAL_SCALED_MAX) * 100),
      };
    },

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

      const userId = useProfileStore().profile?.user_id;
      if (!userId) return;

      useSyncStore().enqueue({
        id: `assessment_answers:${userId}:${sectionId}`,
        table: "assessment_answers",
        operation: "upsert",
        payload: {
          user_id: userId,
          section_id: sectionId,
          answers: { ...answers },
          score: this.scaledScore(sectionId),
          completed_at: new Date(this.completedAt[sectionId]!).toISOString(),
        },
        enqueuedAt: Date.now(),
      });
    },

    clearSection(sectionId: string) {
      delete this.answers[sectionId];
    },

    clearAll() {
      this.answers = {};
      this.completedAt = {};
      this.recommendedHabitIds = [];
      useSyncStore().dequeueByTable("assessment_answers");
    },

    setRecommendedHabits(ids: string[]) {
      this.recommendedHabitIds = ids;
    },

    /**
     * Pull assessment answers from Supabase into local state.
     * Local wins: if a section already has a local answer (queue may have a
     * newer in-flight write), the remote row is skipped for that section.
     * Throws on network or Supabase errors so the hydration caller can surface
     * the error state.
     */
    async hydrateFromSupabase(userId: string) {
      const { data, error } = await supabase
        .from("assessment_answers")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      if (!data || data.length === 0) return;

      for (const row of data) {
        if (this.answers[row.section_id] !== undefined) continue;
        this.answers[row.section_id] = row.answers as SectionAnswers;
        this.completedAt[row.section_id] = new Date(row.completed_at).getTime();
      }
    },
  },

  persist: true,
});
