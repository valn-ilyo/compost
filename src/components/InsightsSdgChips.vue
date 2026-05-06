<script setup lang="ts">
import type { buildSdgChips } from "@/data/sdgs";

defineProps<{
  chips: ReturnType<typeof buildSdgChips>;
}>();
</script>

<template>
  <div class="d-flex flex-wrap ga-2">
    <v-chip
      v-for="(c, i) in chips"
      :key="c.sdg.id"
      v-motion
      :initial="{ opacity: 0, scale: 0.5, y: 10 }"
      :enter="{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: 440,
          damping: 22,
          delay: 60 + i * 40,
        },
      }"
      :color="c.color"
      :href="`https://sdgs.un.org/goals/goal${c.sdg.number}`"
      target="_blank"
      rel="noopener noreferrer"
      rounded="pill"
    >
      <span class="text-medium-emphasis me-1">{{ c.sdg.number }} :</span>{{ c.sdg.name }}
    </v-chip>
  </div>
</template>
