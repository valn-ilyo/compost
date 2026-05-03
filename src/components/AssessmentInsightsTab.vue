<script setup lang="ts">
import { computed, ref } from "vue";
import { useAssessmentStore } from "@/stores/assessment";
import { getBadge, getTagline, WEAK_THRESHOLD } from "@/data/badge";
import { getInsightsForAssessment } from "@/data/insights";
import { HABIT_TEMPLATES } from "@/data/habits";
import type { HabitTemplate } from "@/types/app.types";

import { buildSdgChips } from "@/data/sdgs";
import { scoreColor } from "@/lib/scoring";
import { SECTIONS } from "@/data";

import InsightsScoreHero from "@/components/InsightsScoreHero.vue";
import InsightsBreakdownBars from "@/components/InsightsBreakdownBars.vue";
import InsightsContinueAssessment from "@/components/InsightsContinueAssessment.vue";
import InsightsPanel from "@/components/InsightsPanel.vue";
import InsightsHabitPanel from "@/components/InsightsHabitPanel.vue";
import InsightsSdgChips from "@/components/InsightsSdgChips.vue";
import { useMasteryStore } from "@/stores/mastery";

const store = useAssessmentStore();
const masteryStore = useMasteryStore();

// Switch label when all 3 active slots are filled OR all recommendations are consumed
// (e.g. 2 active + 1 paused leaves linkedHabits empty but activeHabits.length is still 2)
const habitsLabel = computed(() =>
  masteryStore.activeHabits.length >= 3 || linkedHabits.value.length === 0
    ? "What you're working on"
    : "Recommendations",
);

// ── Collapse state ─────────────────────────────────────────────────────────────
const insightsOpen = ref(true);
const habitsOpen = ref(true);
const sdgOpen = ref(true);

// ── Completeness ──────────────────────────────────────────────────────────────
const completedIds = computed(() => new Set(store.sectionResults.map((r) => r.meta.id)));
const isComplete = computed(() => SECTIONS.every((s) => completedIds.value.has(s.id)));

// ── Hero ──────────────────────────────────────────────────────────────────────
const achieved = computed(() => store.overallScore.achieved);
const outOf = computed(() => store.overallScore.outOf);
const pct = computed(() => (outOf.value > 0 ? achieved.value / outOf.value : 0));
const color = computed(() => scoreColor(pct.value));

const badge = computed(() => getBadge(store.overallScore.normalized));
const weakSections = computed(() =>
  store.sectionResults
    .filter((r) => r.scaled / r.meta.scaledMax < WEAK_THRESHOLD)
    .map((r) => r.meta.id),
);

const heroProps = computed(() => ({
  normalized: store.overallScore.normalized,
  normalizedOutOf: store.overallScore.normalizedOutOf,
  ringValue: outOf.value > 0 ? Math.round((achieved.value / outOf.value) * 100) : 0,
  color: color.value,
  badgeColor: isComplete.value ? color.value : "secondary",
  badgeLabel: isComplete.value ? badge.value.label : "Too early to say",
  tagline: isComplete.value
    ? getTagline(badge.value, weakSections.value)
    : "Partial picture. Finish the rest to see your full score.",
}));

// ── Breakdown bars ────────────────────────────────────────────────────────────
const sections = computed(() =>
  store.sectionResults.map((r) => {
    const p = r.scaled / r.meta.scaledMax;
    return {
      id: r.meta.id,
      label: r.meta.label,
      icon: r.meta.icon,
      barValue: Math.round(p * 100),
      color: scoreColor(p),
    };
  }),
);

// ── Incomplete sections ───────────────────────────────────────────────────────
const incompleteSections = computed(() => SECTIONS.filter((s) => !completedIds.value.has(s.id)));

// ── Insights ──────────────────────────────────────────────────────────────────
// getInsightsForAssessment returns up to 9 actionable candidates so the recommendation
// loop can always find 3 distinct habits even when merged habits share questions.
// The Reflections panel only shows the first 4 actionable entries — same as before.
const insights = computed(() => {
  const all = getInsightsForAssessment(store.answers);
  // Split: noHabit entries are marked isAffirmation=true but still contextual
  // The affirmation is always the last item; noHabit entries are between the
  // actionable block and the affirmation. We keep up to 4 non-affirmation,
  // non-noHabit entries for display, plus all noHabit entries, plus the affirmation.
  const actionable = all.filter((i) => !i.isAffirmation).slice(0, 4);
  const noHabitContextual = all.filter((i) => i.isAffirmation && i.noHabit === true);
  const affirmation = all.filter((i) => i.isAffirmation && !i.noHabit).slice(-1);
  return [...actionable, ...noHabitContextual, ...affirmation];
});
const hasInsights = computed(() => isComplete.value && insights.value.length > 0);

// ── Habit recommendations ─────────────────────────────────────────────────────
// Use the persisted recommendedHabitIds as the single source of truth so that
// ordering here matches the habit library exactly.
const linkedHabits = computed(() =>
  store.recommendedHabitIds
    .filter(
      (id) =>
        !masteryStore.activeTemplateIds.has(id) &&
        !masteryStore.pausedTemplateIds.has(id) &&
        !masteryStore.masteredTemplateIds.has(id) &&
        !masteryStore.masteredSlotTemplateIds.has(id),
    )
    .map((id) => HABIT_TEMPLATES.find((h) => h.id === id))
    .filter((h): h is HabitTemplate => h !== undefined),
);

// ── SDG chips ─────────────────────────────────────────────────────────────────
const chips = computed(() => {
  const colorMap = Object.fromEntries(
    store.sectionResults.map((r) => [r.meta.id, scoreColor(r.scaled / r.meta.scaledMax)]),
  );
  return buildSdgChips(colorMap);
});
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-empty-state
          v-if="store.sectionResults.length === 0"
          v-motion
          :initial="{ opacity: 0, scale: 0.92, y: 24 }"
          :enter="{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 260, damping: 22 },
          }"
          class="d-flex align-center"
          height="50vh"
          icon="mdi-chart-arc"
          title="Nothing here yet"
          text="Complete a section to see your first results."
        />

        <template v-else>
          <InsightsScoreHero v-bind="heroProps" />

          <InsightsBreakdownBars :sections="sections" />

          <v-divider
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { duration: 500, delay: 200 } }"
            class="mt-8"
          />

          <InsightsContinueAssessment v-if="!isComplete" :sections="incompleteSections" />

          <!-- ── Insights ── -->
          <template v-if="hasInsights">
            <div
              class="d-flex align-center justify-space-between mt-6 mb-3 cursor-pointer"
              role="button"
              @click="insightsOpen = !insightsOpen"
            >
              <p
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  transition: { type: 'spring', stiffness: 300, damping: 22, delay: 80 },
                }"
                class="text-overline text-medium-emphasis mb-0"
              >
                Reflections
              </p>
              <v-icon
                :icon="insightsOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                color="medium-emphasis"
                size="18"
              />
            </div>
            <v-expand-transition>
              <div v-show="insightsOpen" class="overflow-hidden">
                <InsightsPanel :insights="insights" />
              </div>
            </v-expand-transition>
          </template>

          <!-- ── Suggested Habits ── -->
          <template
            v-if="isComplete && (masteryStore.activeHabits.length > 0 || linkedHabits.length > 0)"
          >
            <div
              class="d-flex align-center justify-space-between mt-6 mb-3 cursor-pointer"
              role="button"
              @click="habitsOpen = !habitsOpen"
            >
              <p
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  transition: { type: 'spring', stiffness: 300, damping: 22, delay: 80 },
                }"
                class="text-overline text-medium-emphasis mb-0"
              >
                {{ habitsLabel }}
              </p>
              <v-icon
                :icon="habitsOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                color="medium-emphasis"
                size="18"
              />
            </div>
            <v-expand-transition>
              <div v-show="habitsOpen" class="overflow-hidden">
                <InsightsHabitPanel :templates="linkedHabits" />
              </div>
            </v-expand-transition>
          </template>

          <!-- ── SDG Connections ── -->
          <template v-if="isComplete">
            <div
              class="d-flex align-center justify-space-between mt-6 mb-3 cursor-pointer"
              role="button"
              @click="sdgOpen = !sdgOpen"
            >
              <p
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  transition: { type: 'spring', stiffness: 300, damping: 22, delay: 80 },
                }"
                class="text-overline text-medium-emphasis mb-0"
              >
                SDG Connections
              </p>
              <v-icon
                :icon="sdgOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                color="medium-emphasis"
                size="18"
              />
            </div>
            <v-expand-transition>
              <div v-show="sdgOpen" class="pb-4">
                <InsightsSdgChips :chips="chips" />
              </div>
            </v-expand-transition>
          </template>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>
