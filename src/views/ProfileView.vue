<script setup lang="ts">
import { useProfileStore } from "@/stores/profile";
import { useLogout } from "@/composables/useLogout";
import AppBarProfile from "@/components/AppBarProfile.vue";

const { logout, loggingOut } = useLogout();
const store = useProfileStore();
</script>

<template>
  <AppBarProfile />
  <v-container class="pt-0">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <!-- name -->
        <h1
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }"
          class="font-condensed font-weight-bold text-onSurface text-center"
        >
          {{ store.profile?.name || "No name set" }}
        </h1>
        <!-- details section -->
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { duration: 200 } }"
          class="text-overline text-medium-emphasis px-1 mb-1"
        >
          Details
        </div>
        <v-card
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }"
          rounded="xl"
          border
          flat
        >
          <v-list lines="two">
            <v-list-item
              prepend-icon="mdi-identifier"
              title="Roll Number"
              :subtitle="store.profile?.roll_no || 'Not set'"
            />
            <v-divider />
            <v-list-item
              prepend-icon="mdi-gender-male-female"
              title="Gender"
              :subtitle="store.profile?.gender || 'Not set'"
            />
            <v-divider />
            <v-list-item
              prepend-icon="mdi-calendar-outline"
              title="Date of Birth"
              :subtitle="store.profile?.dob || 'Not set'"
            />
          </v-list>
        </v-card>
        <!-- actions section -->
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { duration: 200 } }"
          class="text-overline text-medium-emphasis px-1 mb-1 mt-5"
        >
          Actions
        </div>
        <v-card
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }"
          flat
          rounded="xl pa-0"
          border
        >
          <v-list-item
            prepend-icon="mdi-pencil-outline"
            title="Edit Profile"
            append-icon="mdi-chevron-right"
            link
            to="/profile/edit"
            class="rounded-t-xl"
            size="large"
          />
          <v-divider />
          <v-list-item
            prepend-icon="mdi-logout"
            base-color="error"
            link
            class="rounded-b-xl"
            size="large"
            :disabled="loggingOut"
            @click="logout()"
          >
            <v-list-item-title :class="{ 'text-flashing': loggingOut }">
              {{ loggingOut ? "Logging out…" : "Logout" }}
            </v-list-item-title>
          </v-list-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.text-flashing {
  animation: flash 1s ease-in-out infinite;
}
@keyframes flash {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
