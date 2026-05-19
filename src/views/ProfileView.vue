<script setup lang="ts">
import { ref } from "vue"
import { useProfileStore } from "@/stores/profile"
import { useLogout } from "@/composables/useLogout"
import { useSyncStore } from "@/stores/sync"
import { openFeedbackForm } from "@/services/feedbackForm"
import AppBarProfile from "@/components/app/AppBarProfile.vue"

const { logout, loggingOut } = useLogout()
const store = useProfileStore()
const syncStore = useSyncStore()
const showLogoutWarning = ref(false)

// TODO [ProfileView > Logout]
// If queue.length > 0 → show warning dialog
// Otherwise → logout() directly (drain best-effort, resetAllStores, signOut, navigate /auth)
function handleLogoutClick() {
  if (syncStore.queue.length > 0) {
    showLogoutWarning.value = true
  } else {
    logout()
  }
}

// TODO [ProfileView > Reset assessment]
// Confirmation dialog. On confirm:
// 1. assessmentStore.clearAll() — clears local state + dequeues pending items
// 2. Call Supabase directly to DELETE all assessment_answers for this user
//    (must succeed before confirming — destructive)

// TODO [ProfileView > Delete account]
// Confirmation dialog. On confirm:
// 1. Call Supabase Edge Function that deletes all user data server-side
// 2. resetAllStores()
// 3. supabase.auth.signOut()
// 4. Navigate to AuthView
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
            title="Edit profile"
            link
            to="/profile/edit"
            class="rounded-t-xl"
            size="large"
          />
          <template v-if="store.profile?.is_admin">
            <v-divider />
            <v-list-item
              prepend-icon="mdi-shield-outline"
              title="Admin"
              link
              to="/admin"
              size="large"
            />
          </template>
          <v-divider />
          <v-list-item
            prepend-icon="mdi-comment-alert-outline"
            title="Feedback & support"
            size="large"
            link
            @click="openFeedbackForm"
          />
          <v-divider />
          <v-list-item
            prepend-icon="mdi-logout"
            base-color="error"
            link
            class="rounded-b-xl"
            size="large"
            :disabled="loggingOut"
            @click="handleLogoutClick"
          >
            <v-list-item-title :class="{ 'text-flashing': loggingOut }">
              {{ loggingOut ? "Logging out…" : "Logout" }}
            </v-list-item-title>
          </v-list-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Unsynced changes warning dialog -->
  <v-dialog v-model="showLogoutWarning" max-width="360">
    <v-card rounded="xl">
      <v-card-title class="text-body-1 font-weight-bold pt-5 px-5"> Unsynced changes </v-card-title>
      <v-card-text class="px-5 text-body-2 text-medium-emphasis">
        You're offline or your data hasn't finished saving. Log out now and these changes won't be
        backed up to your account.
      </v-card-text>
      <v-card-actions class="px-5 pb-5 gap-2">
        <v-btn
          color="error"
          variant="tonal"
          :loading="loggingOut"
          @click="
            () => {
              showLogoutWarning = false;
              logout();
            }
          "
        >
          Log out anyway
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="showLogoutWarning = false">Keep syncing</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
