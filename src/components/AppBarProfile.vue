<script setup lang="ts">
import { ref } from "vue";
import { useProfileStore } from "@/stores/profile";
import { useThemeStore } from "@/stores/theme";
import { useAssessmentStore } from "@/stores/assessment";
import { useNotifier } from "@/composables/useNotifier";

const profileStore = useProfileStore();
const themeStore = useThemeStore();
const assessmentStore = useAssessmentStore();
const { notify } = useNotifier();

const showConfirmDialog = ref(false);

function clearAll() {
  assessmentStore.clearAll();
  notify({
    message: "All assessments cleared.",
    color: "info",
  });
}
</script>

<template>
  <v-app-bar color="surface" flat>
    <v-app-bar-title>
      <span class="font-condensed">{{ profileStore.userEmail || "Profile" }}</span>
    </v-app-bar-title>

    <template #append>
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" icon="mdi-cog-outline" />
        </template>
        <v-list elevation="1" density="compact" rounded="lg" bg-color="surface-light">
          <v-list-item
            :prepend-icon="
              themeStore.currentTheme === 'light'
                ? 'mdi-moon-waning-crescent'
                : 'mdi-white-balance-sunny'
            "
            :title="themeStore.currentTheme === 'light' ? 'Dark mode' : 'Light mode'"
            @click="themeStore.toggleTheme()"
          />
          <v-list-item
            :prepend-icon="themeStore.contrastIcon"
            :title="themeStore.contrastLabel"
            @click="themeStore.cycleContrast()"
          />
          <v-list-item
            prepend-icon="mdi-delete-sweep-outline"
            title="Reset assessments"
            base-color="error"
            @click="showConfirmDialog = true"
          />
        </v-list>
      </v-menu>

      <v-btn icon="mdi-information-variant" to="/docs" />
    </template>
  </v-app-bar>

  <v-dialog v-model="showConfirmDialog" width="auto">
    <v-card rounded="lg">
      <v-card-title class="pt-6 px-6">Clear all assessments?</v-card-title>
      <v-card-text class="px-6 text-medium-emphasis">
        All your answers will be deleted. This can't be undone.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="error"
          variant="text"
          @click="
            () => {
              clearAll();
              showConfirmDialog = false;
            }
          "
        >
          Reset
        </v-btn>
        <v-btn color="primary" variant="flat" rounded="lg" @click="showConfirmDialog = false">
          Keep it
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
