<script setup lang="ts">
import { ref } from "vue";

import { useProfileStore } from "@/stores/profile";
import { useLogout } from "@/composables/useLogout";
import AppBarProfile from "@/components/AppBarProfile.vue";

const { logout } = useLogout();
const loggingOut = ref(false);

const store = useProfileStore();

const handleLogout = async () => {
  loggingOut.value = true;
  await logout();
};
</script>

<template>
  <AppBarProfile />

  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">

        <!-- avatar + name -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } }"
          class="d-flex flex-column align-center text-center"
        >
          <v-avatar size="128" color="primary-container" class="border-md">
            <v-icon icon="mdi-account" size="64" color="primary" />
          </v-avatar>
          <h1 class="text-h5 font-condensed font-weight-bold text-onSurface">
            {{ store.profile?.name || "No name set" }}
          </h1>
        </div>

        <!-- details section -->
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { duration: 150, delay: 60 } }"
          class="text-overline text-medium-emphasis px-1 mb-1"
        >Details</div>

        <v-card
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 100 } }"
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
          :enter="{ opacity: 1, transition: { duration: 150, delay: 150 } }"
          class="text-overline text-medium-emphasis px-1 mb-1 mt-5"
        >Actions</div>

        <v-card
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 180 } }"
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
            title="Logout"
            base-color="error"
            link
            class="rounded-b-xl"
            size="large"
            @click="handleLogout"
            :loading="loggingOut"
          />
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>