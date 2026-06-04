<!-- View -- edit profile form wrapped in a centered card -->
<script setup lang="ts">
import { useRouter } from "vue-router"
import ProfileForm from "@/components/profile/ProfileForm.vue"

const router = useRouter()
</script>

<template>
  <v-sheet
    color="background"
    class="d-flex flex-column align-center justify-center w-100"
    style="min-height: 100dvh"
  >
    <v-card
      v-motion
      :initial="{ opacity: 0, y: 24, scale: 0.97 }"
      :enter="{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } }"
      class="w-100 w-sm-75 w-md-50 w-lg-33"
      color="background"
      elevation="0"
      style="opacity: 0"
    >
      <v-card-item class="pa-6 pb-0">
        <v-card-title
          v-motion
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 80 } }"
          class="font-weight-bold text-onSecondaryContainer"
          style="opacity: 0"
        >Edit Profile</v-card-title>
        <v-card-subtitle
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { duration: 200, delay: 140 } }"
          class="text-onSecondaryContainer opacity-70 my-1"
          style="opacity: 0"
        >
          Change anything you need.
        </v-card-subtitle>
      </v-card-item>

      <v-card-text
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22, delay: 180 } }"
        class="pa-6 pt-2"
        style="opacity: 0"
      >
        <ProfileForm :edit-mode="true" @cancel="router.push('/profile')" />
      </v-card-text>
    </v-card>
  </v-sheet>
</template>
