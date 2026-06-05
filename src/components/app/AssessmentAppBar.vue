<!-- Component -- app bar for the assessment view with check-in / insights tab navigation -->
<script setup lang="ts">
import { useAssessmentStore } from '@/stores/assessment.store'

const store = useAssessmentStore()
</script>

<template>
  <VAppBar color="surface" flat>
    <VRow justify="center">
      <VCol cols="12" md="6">
        <VTabs v-model="store.activeTab" grow slider-transition="fade">
          <VTab rounded="0" value="checkin">Check-In</VTab>
          <VTab rounded="0" value="insights">Insights</VTab>
        </VTabs>
      </VCol>
    </VRow>
  </VAppBar>
</template>
