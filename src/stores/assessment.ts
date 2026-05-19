// ─── assessmentStore ──────────────────────────────────────────────────────────
// Stores section answers and derives assessment scores.
//
// Unlike the mastery ledgers, assessment answers are mutable (a user can retake
// a section). The store shape is largely unchanged from the pre-migration design
// because answers and scores are not ledger-style state — they don't accumulate
// across days, they represent the user's current self-assessment.
//
// Sync strategy: submitSection enqueues an assessment_answers upsert. The
// conflict target is (user_id, section_id) so retakes overwrite the previous
// answer cleanly. Mutable upsert — not ignoreDuplicates.
// ─────────────────────────────────────────────────────────────────────────────

import { defineStore } from 'pinia'
import type { SectionMeta, SectionAnswers, AssessmentState } from '../types/app'
export type { SectionAnswers }
import { SECTIONS } from '@/data'
import { useSyncStore } from '@/stores/sync'
import { supabase } from '@/services/supabase'
import type { AssessmentAnswerRow } from '@/types/database'

// Total scaled marks across all 7 sections — the denominator for overallScore.
const TOTAL_SCALED_MAX = SECTIONS.reduce((sum, s) => sum + s.scaledMax, 0)

export const useAssessmentStore = defineStore('assessment', {
  state: (): AssessmentState & { userId: string } => ({
    answers: {},
    completedAt: {},
    activeTab: 'checkin',
    recommendedHabitIds: [],
    // Populated during hydrateFromSupabase(). Carried on every enqueued row.
    userId: '',
  }),

  getters: {
    /** True if the user has submitted answers for this section. */
    isCompleted:
      (state) =>
      (sectionId: string): boolean =>
        sectionId in state.answers && state.answers[sectionId] !== undefined,

    /** Raw point total for a section (sum of all question answer values). */
    rawScore:
      (state) =>
      (sectionId: string): number => {
        const sectionAnswers = state.answers[sectionId]
        if (!sectionAnswers) return 0
        return Object.values(sectionAnswers).reduce((sum, v) => sum + v, 0)
      },

    /**
     * Scaled score for a section — maps the raw score onto the section's
     * weighted contribution to the 325-point total.
     */
    scaledScore(): (sectionId: string) => number {
      return (sectionId: string): number => {
        const meta = SECTIONS.find(s => s.id === sectionId)
        if (!meta) return 0
        return Math.round((this.rawScore(sectionId) / meta.maxRaw) * meta.scaledMax)
      }
    },

    /**
     * Overall score across all completed sections, normalised to 0–100.
     * outOf reflects completed sections only so partial completion is still
     * meaningful — the normalizedOutOf is always 100.
     */
    overallScore(): { achieved: number; outOf: number; normalized: number; normalizedOutOf: number } {
      const completed = SECTIONS.filter(s => this.isCompleted(s.id))
      if (completed.length === 0) {
        return { achieved: 0, outOf: 0, normalized: 0, normalizedOutOf: 100 }
      }
      const achieved = completed.reduce((sum, s) => sum + this.scaledScore(s.id), 0)
      const outOf = completed.reduce((sum, s) => sum + s.scaledMax, 0)
      const normalized = Math.round((achieved / TOTAL_SCALED_MAX) * 100)
      return { achieved, outOf, normalized, normalizedOutOf: 100 }
    },

    /** Completed sections paired with their raw and scaled scores. */
    sectionResults(): Array<{ meta: SectionMeta; raw: number; scaled: number }> {
      return SECTIONS
        .filter(s => this.isCompleted(s.id))
        .map(s => ({ meta: s, raw: this.rawScore(s.id), scaled: this.scaledScore(s.id) }))
    },
  },

  actions: {
    /**
     * Record answers for a section and enqueue an upsert to Supabase.
     * Idempotency key: (user_id, section_id) — retakes overwrite cleanly.
     */
    submitSection(sectionId: string, answers: SectionAnswers) {
      this.answers[sectionId] = answers
      this.completedAt[sectionId] = Date.now()

      if (!this.userId) return  // not hydrated yet — skip enqueue (no-op guard)

      useSyncStore().enqueue({
        id: `assessment_answers:${this.userId}:${sectionId}`,
        table: 'assessment_answers',
        operation: 'upsert',
        payload: {
          user_id: this.userId,
          section_id: sectionId,
          answers,
          score: this.scaledScore(sectionId),
          completed_at: new Date().toISOString(),
        },
        enqueuedAt: Date.now(),
      })
    },

    clearSection(sectionId: string) {
      delete this.answers[sectionId]
    },

    /**
     * Reset the entire assessment locally and dequeue any pending writes.
     * Does not delete rows from Supabase — the user can retake and resubmit.
     */
    clearAll() {
      this.answers = {}
      this.completedAt = {}
      this.activeTab = 'checkin'
      this.recommendedHabitIds = []
      useSyncStore().dequeueByTable('assessment_answers')
    },

    setRecommendedHabits(ids: string[]) {
      this.recommendedHabitIds = ids
    },

    /**
     * Pull assessment_answers from Supabase and merge into local state.
     *
     * Merge rule:
     *   - forceRemote = true (reconnect): server wins — overwrite all local answers.
     *   - forceRemote = false (cold start): local wins — only fill in sections not
     *     yet answered locally. This preserves in-progress answers entered offline.
     */
    async hydrateFromSupabase(newUserId: string, forceRemote = false) {
      this.userId = newUserId

      const { data, error } = await supabase
        .from('assessment_answers')
        .select('*')
        .eq('user_id', newUserId)

      if (error) throw error

      for (const row of (data as AssessmentAnswerRow[])) {
        if (forceRemote || !this.isCompleted(row.section_id)) {
          this.answers[row.section_id] = row.answers
          this.completedAt[row.section_id] = new Date(row.completed_at).getTime()
        }
      }
    },
  },

  persist: true,
})
