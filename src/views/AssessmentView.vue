<!-- View -- assessment host with check-in and insights tabs -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment.store'
import CheckInTab from '@/components/assessment/AssessmentCheckInTab.vue'
import InsightsTab from '@/components/assessment/AssessmentInsightsTab.vue'
import AssessmentAppBar from '@/components/app/AssessmentAppBar.vue'

const store = useAssessmentStore()
const route = useRoute()

onMounted(() => {
  const tab = route.query.tab
  if (tab === 'checkin' || tab === 'insights') {
    store.activeTab = tab
  }
})
</script>

<template>
  <AssessmentAppBar />
  <VContainer fluid class="pa-0">
    <VTabsWindow v-model="store.activeTab">
      <VTabsWindowItem value="checkin">
        <CheckInTab />
      </VTabsWindowItem>
      <VTabsWindowItem value="insights">
        <InsightsTab />
      </VTabsWindowItem>
    </VTabsWindow>
  </VContainer>
</template>
