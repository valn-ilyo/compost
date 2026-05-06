<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
  <v-sheet
    color="background"
    class="d-flex flex-column align-center justify-center w-100 px-2"
    style="min-height: 100dvh"
  >
    <v-card class="w-100 w-sm-75 w-md-50 w-lg-33 pa-2 text-center" color="background" elevation="0">
      <v-icon
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

      <v-card-title
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
      </v-card-title>

      <v-card-text
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
      </v-card-text>

      <v-card-actions
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 200 },
        }"
        class="d-flex flex-column align-center justify-center"
      >
        <v-btn
          color="primary"
          rounded="lg"
          size="large"
          flat
          class="text-none"
          @click="router.push('/')"
          prepend-icon="mdi-home-outline"
        >
          Go home
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-sheet>
</template>
