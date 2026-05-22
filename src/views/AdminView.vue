<script setup lang="ts">
// TODO [Phase 4] Implement admin analytics dashboard.
// Requires: get_admin_analytics RPC, profileStore, filter state, chart helpers.
import { useRouter } from "vue-router";
const router = useRouter();
function goBack(): void {
  router.back();
}
</script>

<template>
  <v-app-bar color="primary" flat class="border border-b">
    <template #prepend>
      <v-btn icon="mdi-home-outline" @click="goBack" />
    </template>
    <v-app-bar-title>
      <span class="font-condensed">Admin</span>
    </v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-container class="pt-8 text-center">
      <v-icon icon="mdi-hammer-wrench" size="40" color="medium-emphasis" class="mb-3" />
      <div class="text-body-1 text-medium-emphasis">Admin dashboard coming in Phase 4.</div>
    </v-container>
  </v-main>
</template>
