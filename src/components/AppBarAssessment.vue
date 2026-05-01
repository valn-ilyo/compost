<script setup lang="ts">
import { useAssessmentStore } from "@/stores/assessment";

const store = useAssessmentStore();
</script>

<template>
  <v-app-bar color="surface" flat>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-tabs v-model="store.activeTab" grow slider-transition="fade">
          <v-tab rounded="0" value="checkin">Check-In</v-tab>
          <v-tab rounded="0" value="insights">Insights</v-tab>
        </v-tabs>
      </v-col>
    </v-row>
  </v-app-bar>
</template>
