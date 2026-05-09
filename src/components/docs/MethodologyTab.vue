<script setup lang="ts">
import MethodologySectionOverview from "./methodology/MethodologySectionOverview.vue";
import MethodologySectionScoring from "./methodology/MethodologySectionScoring.vue";
import MethodologySectionBadges from "./methodology/MethodologySectionBadges.vue";
import MethodologySectionHabits from "./methodology/MethodologySectionHabits.vue";
import MethodologySectionInsights from "./methodology/MethodologySectionInsights.vue";
import MethodologySectionQuestions from "./methodology/MethodologySectionQuestions.vue";
import MethodologySectionLimitations from "./methodology/MethodologySectionLimitations.vue";

defineProps<{
  activeSection: string;
}>();
</script>

<template>
  <MethodologySectionOverview v-if="activeSection === 'overview'" />
  <MethodologySectionScoring v-if="activeSection === 'scoring'" />
  <MethodologySectionBadges v-if="activeSection === 'badges'" />
  <MethodologySectionHabits v-if="activeSection === 'habits'" />
  <MethodologySectionInsights v-if="activeSection === 'insights'" />
  <MethodologySectionQuestions v-if="activeSection === 'questions'" />
  <MethodologySectionLimitations v-if="activeSection === 'limitations'" />
</template>
