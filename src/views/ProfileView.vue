<!-- View -- profile screen with details, actions, logout, and danger zone -->
<script setup lang="ts">
import { ref } from 'vue'
import { useProfileStore } from '@/stores/profile.store'
import { useLogout } from '@/composables/useLogout'
import { useSyncStore } from '@/stores/sync.store'
import { openFeedbackForm } from '@/services/feedback-form.service'
import ProfileAppBar from '@/components/app/ProfileAppBar.vue'

const { logout, loggingOut } = useLogout()
const store = useProfileStore()
const syncStore = useSyncStore()
const showLogoutWarning = ref(false)

function handleLogoutClick() {
  if (syncStore.queue.length > 0) {
    showLogoutWarning.value = true
  } else {
    logout()
  }
}
</script>

<template>
  <ProfileAppBar />
  <VContainer class="pt-0">
    <VRow justify="center">
      <VCol cols="12" sm="10" md="8" lg="6" xl="4">
        <h1
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }"
          class="font-condensed font-weight-bold text-onSurface text-center"
        >
          {{ store.profile?.name || 'No name set' }}
        </h1>
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { duration: 200 } }"
          class="text-overline text-medium-emphasis px-1 mb-1"
        >
          Details
        </div>
        <VCard
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }"
          rounded="xl"
          border
          flat
        >
          <VList lines="two">
            <VListItem
              prepend-icon="mdi-identifier"
              title="Roll Number"
              :subtitle="store.profile?.roll_no || 'Not set'"
            />
            <VDivider />
            <VListItem
              prepend-icon="mdi-gender-male-female"
              title="Gender"
              :subtitle="store.profile?.gender || 'Not set'"
            />
            <VDivider />
            <VListItem
              prepend-icon="mdi-calendar-outline"
              title="Date of Birth"
              :subtitle="store.profile?.dob || 'Not set'"
            />
          </VList>
        </VCard>
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { duration: 200 } }"
          class="text-overline text-medium-emphasis px-1 mb-1 mt-5"
        >
          Actions
        </div>
        <VCard
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }"
          flat
          rounded="xl pa-0"
          border
        >
          <VListItem
            prepend-icon="mdi-pencil-outline"
            title="Edit profile"
            link
            to="/profile/edit"
            class="rounded-t-xl"
            size="large"
          />
          <template v-if="store.profile?.is_admin">
            <VDivider />
            <VListItem
              prepend-icon="mdi-shield-outline"
              title="Admin"
              link
              to="/admin"
              size="large"
            />
          </template>
          <VDivider />
          <VListItem
            prepend-icon="mdi-comment-alert-outline"
            title="Feedback & support"
            size="large"
            link
            @click="openFeedbackForm"
          />
          <VDivider />
          <VListItem
            prepend-icon="mdi-logout"
            base-color="error"
            link
            class="rounded-b-xl"
            size="large"
            :disabled="loggingOut"
            @click="handleLogoutClick"
          >
            <VListItemTitle :class="{ 'text-flashing': loggingOut }">
              {{ loggingOut ? 'Logging out…' : 'Logout' }}
            </VListItemTitle>
          </VListItem>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>

  <VDialog v-model="showLogoutWarning" max-width="360">
    <VCard rounded="xl">
      <VCardTitle class="text-body-1 font-weight-bold pt-5 px-5"> Unsynced changes </VCardTitle>
      <VCardText class="px-5 text-body-2 text-medium-emphasis">
        You're offline or your data hasn't finished saving. Log out now and these changes won't be
        backed up to your account.
      </VCardText>
      <VCardActions class="px-5 pb-5 gap-2">
        <VBtn
          color="error"
          variant="tonal"
          :loading="loggingOut"
          @click="
            () => {
              showLogoutWarning = false
              logout()
            }
          "
        >
          Log out anyway
        </VBtn>
        <VSpacer />
        <VBtn variant="text" @click="showLogoutWarning = false">Keep syncing</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
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
