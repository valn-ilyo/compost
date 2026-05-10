<script setup lang="ts">
import { useRouter } from "vue-router";
import { useProfileStore } from "@/stores/profile";

const router = useRouter();
const profileStore = useProfileStore();
</script>

<template>
  <v-app-bar color="surface" flat>
    <template #prepend>
      <v-btn icon="mdi-arrow-left" @click="router.back()" />
    </template>
    <v-app-bar-title>
      <span class="font-condensed">Admin</span>
    </v-app-bar-title>
  </v-app-bar>

  <v-container class="pt-0">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <div
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }"
        >
          <!-- identity card -->
          <v-card rounded="xl" border flat class="mb-4">
            <v-list-item
              prepend-icon="mdi-shield-account-outline"
              :title="profileStore.profile?.name || 'Admin'"
              :subtitle="profileStore.userEmail || ''"
            >
              <template #append>
                <v-chip color="primary" size="small" variant="tonal">Admin</v-chip>
              </template>
            </v-list-item>
          </v-card>

          <!-- placeholder sections -->
          <div class="text-overline text-medium-emphasis px-1 mb-1">Analytics</div>
          <v-card rounded="xl" border flat class="mb-5">
            <v-list lines="one">
              <v-list-item
                prepend-icon="mdi-account-group-outline"
                title="User report"
                subtitle="Coming soon"
                disabled
              />
              <v-divider />
              <v-list-item
                prepend-icon="mdi-chart-bar-stacked"
                title="Assessment completion"
                subtitle="Coming soon"
                disabled
              />
              <v-divider />
              <v-list-item
                prepend-icon="mdi-leaf-circle-outline"
                title="Habit adoption"
                subtitle="Coming soon"
                disabled
              />
            </v-list>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
