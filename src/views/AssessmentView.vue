<script setup lang="ts">
import { onMounted } from "vue"
import { useRoute } from "vue-router"
import { useAssessmentStore } from "@/stores/assessment.store"
import CheckInTab from "@/components/assessment/AssessmentCheckInTab.vue"
import InsightsTab from "@/components/assessment/AssessmentInsightsTab.vue"
import AssessmentAppBar from "@/components/app/AssessmentAppBar.vue"

const store = useAssessmentStore()
const route = useRoute()

// TODO [AssessmentView > two tabs: Check-in and Insights]
// Sync active tab from route.query.tab on mount
onMounted(() => {
  const tab = route.query.tab
  if (tab === "checkin" || tab === "insights") {
    store.activeTab = tab
  }
})
</script>

<template>
  <AssessmentAppBar />
  <v-container fluid class="pa-0">
    <v-tabs-window v-model="store.activeTab">
      <v-tabs-window-item value="checkin">
        <CheckInTab />
      </v-tabs-window-item>
      <v-tabs-window-item value="insights">
        <InsightsTab />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>
