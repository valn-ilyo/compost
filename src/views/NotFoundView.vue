<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <v-container class="fill-height mt-16" max-width="480">
    <v-row align="center" justify="center">
      <v-col class="text-center">
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

        <p
          v-motion
          :initial="{ opacity: 0, y: 12 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 80 },
          }"
          class="text-h5 font-weight-bold mb-2"
        >
          Page not found
        </p>

        <p
          v-motion
          :initial="{ opacity: 0, y: 12 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 140 },
          }"
          class="text-body-2 text-medium-emphasis mb-8"
        >
          This page doesn't exist. Head back and keep going.
        </p>

        <v-btn
          v-motion
          :initial="{ opacity: 0, y: 12 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 200 },
          }"
          color="primary"
          rounded="lg"
          size="large"
          flat
          @click="router.push('/')"
        >
          Go home
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
