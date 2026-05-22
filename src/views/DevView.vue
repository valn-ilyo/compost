<script setup lang="ts">
// Dev tools — intentionally minimal. Broken store API usages removed pending Phase 4 rewrite.
import { useRouter } from "vue-router";
const router = useRouter();
function previewAuthState(state: "loading" | "error"): void {
  router.push({ name: "auth", query: { preview: state } });
}
</script>

<template>
  <v-app-bar flat>
    <v-app-bar-title>Dev Controls</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="6">
          <!-- ── AuthView preview ──────────────────────────────────────────── -->
          <v-card rounded="lg" class="mb-4">
            <v-card-title class="text-body-1 pt-4">AuthView states</v-card-title>
            <v-card-actions>
              <v-btn
                color="secondary"
                prepend-icon="mdi-loading"
                variant="tonal"
                @click="previewAuthState('loading')"
                >Preview loading</v-btn
              >
              <v-btn
                color="error"
                variant="tonal"
                prepend-icon="mdi-alert-circle-outline"
                @click="previewAuthState('error')"
                >Preview error</v-btn
              >
            </v-card-actions>
          </v-card>

          <v-alert
            type="info"
            variant="tonal"
            icon="mdi-information-outline"
            text="Habit/freeze editors and store controls will be restored in Phase 4 once the store API is stable."
          />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
