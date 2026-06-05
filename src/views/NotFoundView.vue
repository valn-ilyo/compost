<!-- View -- 404 not-found screen with animated icon and home link -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <VSheet
    color="background"
    class="d-flex flex-column align-center justify-center w-100 px-2"
    style="min-height: 100dvh"
  >
    <VCard class="w-100 w-sm-75 w-md-50 w-lg-33 pa-2 text-center" color="background" elevation="0">
      <VIcon
        v-motion
        :initial="{ opacity: 0, scale: 0.7 }"
        :enter="{
          opacity: 1,
          scale: 1,
          transition: { type: 'spring', stiffness: 260, damping: 22 },
        }"
        icon="mdi-leaf-off"
        size="72"
        color="primary"
        class="mb-6"
      />

      <VCardTitle
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 80 },
        }"
        class="text-body-1 font-weight-bold text-wrap"
      >
        Page not found
      </VCardTitle>

      <VCardText
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 140 },
        }"
        class="text-medium-emphasis"
      >
        This page doesn't exist. Head back and keep going.
      </VCardText>

      <VCardActions
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 200 },
        }"
        class="d-flex flex-column align-center justify-center"
      >
        <VBtn
          color="primary"
          rounded="lg"
          size="large"
          flat
          class="text-none"
          prepend-icon="mdi-home-outline"
          @click="router.push('/')"
        >
          Go home
        </VBtn>
      </VCardActions>
    </VCard>
  </VSheet>
</template>
