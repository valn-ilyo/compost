<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAssessmentStore } from "@/stores/assessment";
import CheckInTab from "@/components/assessment/AssessmentCheckInTab.vue";
import InsightsTab from "@/components/assessment/AssessmentInsightsTab.vue";
import AppBarAssessment from "@/components/app/AppBarAssessment.vue";

const store = useAssessmentStore();
const route = useRoute();

onMounted(() => {
  const tab = route.query.tab;
  if (tab === "checkin" || tab === "insights") {
    store.activeTab = tab;
  }
});
</script>

<template>
  <AppBarAssessment />
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
