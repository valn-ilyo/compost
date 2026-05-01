<script setup lang="ts">
import { useDisplay } from "vuetify";
import type { buildSdgChips } from "@/data/sdgs";

defineProps<{
  chips: ReturnType<typeof buildSdgChips>;
}>();

const { mobile } = useDisplay();
</script>

<template>
  <div class="d-flex flex-wrap ga-2">
    <v-menu
      v-for="(c, i) in chips"
      :key="c.sdg.id"
      :open-on-hover="!mobile"
      location="top"
      offset="4"
    >
      <template #activator="{ props }">
        <v-chip
          v-bind="props"
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
          rounded="pill"
        >
          SDG {{ c.sdg.number }}
        </v-chip>
      </template>

      <v-btn
        :href="`https://sdgs.un.org/goals/goal${c.sdg.number}`"
        target="_blank"
        rel="noopener noreferrer"
        rounded="medium"
        append-icon="mdi-open-in-new"
        color="secondary"
        elevation="1"
      >
        {{ c.sdg.name }}
      </v-btn>
    </v-menu>
  </div>
</template>
