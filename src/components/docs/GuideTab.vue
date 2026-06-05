<!-- Component -- guide tab, renders the active guide section by id -->
<script setup lang="ts">
import GuideSectionOverview from './guide/GuideSectionOverview.vue'
import GuideSectionGettingStarted from './guide/GuideSectionGettingStarted.vue'
import GuideSectionAssessment from './guide/GuideSectionAssessment.vue'
import GuideSectionHabits from './guide/GuideSectionHabits.vue'
import GuideSectionScore from './guide/GuideSectionScore.vue'
import GuideSectionInsights from './guide/GuideSectionInsights.vue'
import GuideSectionSync from './guide/GuideSectionSync.vue'
import GuideSectionPrivacy from './guide/GuideSectionPrivacy.vue'

defineProps<{
  activeSection: string
}>()
</script>

<template>
  <GuideSectionOverview v-if="activeSection === 'overview'" />
  <GuideSectionGettingStarted v-if="activeSection === 'getting-started'" />
  <GuideSectionAssessment v-if="activeSection === 'assessment'" />
  <GuideSectionHabits v-if="activeSection === 'habits-and-mastery'" />
  <GuideSectionScore v-if="activeSection === 'score-and-badges'" />
  <GuideSectionInsights v-if="activeSection === 'insights'" />
  <GuideSectionSync v-if="activeSection === 'sync-and-offline'" />
  <GuideSectionPrivacy v-if="activeSection === 'privacy'" />
</template>
