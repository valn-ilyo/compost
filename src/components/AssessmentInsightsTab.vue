<script setup lang="ts">
import { computed, ref } from "vue";
import { useAssessmentStore } from "@/stores/assessment";
import { getBadge, getTagline, getSortedSections, WEAK_THRESHOLD } from "@/data/badge";
import { getSortedQuestions, getInsightsForAssessment } from "@/data/insights";
import { HABIT_TEMPLATES } from "@/data/habits";
import { useMasteryRecommendations } from "@/composables/useMasteryRecommendations";
import type { HabitTemplate } from "@/types/app.types";
import { MAX_SLOTS } from "@/types/app.types";

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
const { recommendedIds, pausedRecommendedIds } = useMasteryRecommendations();

const habitsLabel = computed(() => {
  if (masteryStore.usedSlots >= MAX_SLOTS) return "What you're working on";
  if (linkedHabits.value.length === 0 && pausedRecommendedIds.value.length > 0)
    return "Recommendations paused";
  if (linkedHabits.value.length === 0) return "No recommendations";
  return "Recommendations";
});

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

// ── Sorted sections + weak list (single source of truth for both tagline and insights) ──
const sortedSections = computed(() => getSortedSections(store.sectionResults));
const weakSections = computed(() =>
  sortedSections.value
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
// getInsightsForAssessment returns exactly 5 by construction — no slicing needed.
const insights = computed(() => {
  if (!isComplete.value) return [];
  const sortedQuestions = getSortedQuestions(store.answers, sortedSections.value);
  return getInsightsForAssessment(sortedQuestions, weakSections.value);
});
const hasInsights = computed(() => isComplete.value && insights.value.length > 0);

// ── Habit recommendations ─────────────────────────────────────────────────────
const linkedHabits = computed(() =>
  recommendedIds.value
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
          title="Nothing to show yet"
          text="Answer a few questions to see where you stand."
        >
          <template #actions>
            <v-btn
              variant="flat"
              color="secondary"
              rounded="lg"
              prepend-icon="mdi-arrow-left"
              @click="store.activeTab = 'checkin'"
            >
              Check-In
            </v-btn>
          </template>
        </v-empty-state>

        <template v-else>
          <v-row density="compact">
            <v-col
              v-for="item in [
                { color: 'success', label: 'Good' },
                { color: 'info', label: 'Okay' },
                { color: 'warning', label: 'Fair' },
                { color: 'error', label: 'Poor' },
              ]"
              :key="item.label"
              class="d-flex justify-center mt-1"
            >
              <v-chip
                variant="text"
                label
                density="compact"
                :size="$vuetify.display.smAndDown ? 'small' : 'default'"
                class="text-mono"
              >
                <template #prepend>
                  <v-icon icon="mdi-square" :color="item.color" class="me-1" />
                </template>
                {{ item.label }}
              </v-chip>
            </v-col>
          </v-row>

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

          <!-- ── No recommendations — commendation state ── -->
          <!-- ── Suggested Habits ── -->
          <template v-if="isComplete">
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
                <InsightsHabitPanel
                  :templates="linkedHabits"
                  :has-paused-recs="pausedRecommendedIds.length > 0"
                />
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
                class="text-overline text-medium-emphasis mb-0 d-flex align-center ga-2"
              >
                Connections :

                <a
                  href="https://sdgs.un.org/goals"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-info text-decoration-underline"
                  @click.stop
                  >sdgs.un.org</a
                >
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
