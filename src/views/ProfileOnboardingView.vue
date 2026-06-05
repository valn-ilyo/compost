<!-- View -- first-time profile setup with switch account fallback -->
<script setup lang="ts">
import { ref } from 'vue'
import { useProfileStore } from '@/stores/profile.store'
import { useLogout } from '@/composables/useLogout'
import ProfileForm from '@/components/profile/ProfileForm.vue'

const profileStore = useProfileStore()
const { logout } = useLogout()
const isLoggingOut = ref(false)

const handleLogout = async () => {
  isLoggingOut.value = true
  await logout()
  isLoggingOut.value = false
}
</script>

<template>
  <VSheet
    color="background"
    class="d-flex flex-column align-center justify-center w-100"
    style="min-height: 100dvh"
  >
    <VCard
      v-motion
      :initial="{ opacity: 0, y: 32, scale: 0.97 }"
      :enter="{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 260, damping: 22 },
      }"
      class="w-100 w-sm-75 w-md-50 w-lg-33"
      color="background"
      elevation="0"
    >
      <VCardItem class="pa-6 pb-0">
        <VCardTitle
          v-motion
          :initial="{ opacity: 0, y: 8 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 80 },
          }"
          class="font-weight-bold text-onSecondaryContainer"
          >Welcome</VCardTitle
        >
        <VCardSubtitle
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { duration: 200, delay: 140 } }"
          class="text-onSecondaryContainer opacity-70 my-1"
        >
          A few quick things before you start.
        </VCardSubtitle>
      </VCardItem>
      <VCardText
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 260, damping: 22, delay: 180 },
        }"
        class="pa-6 pt-2"
      >
        <ProfileForm :disabled="isLoggingOut" />
        <VBtn
          :loading="isLoggingOut"
          variant="text"
          color="secondary"
          size="small"
          class="mt-2 mx-auto d-block text-none"
          @click="handleLogout"
        >
          <span class="text-medium-emphasis">Not {{ profileStore.userEmail }}?</span>
          <span class="ms-1 font-weight-bold text-primary">Switch account</span>
        </VBtn>
      </VCardText>
    </VCard>
  </VSheet>
</template>
