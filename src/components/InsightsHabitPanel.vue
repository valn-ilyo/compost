<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useMasteryStore } from "@/stores/mastery";
import type { HabitTemplate } from "@/types/app.types";

const props = defineProps<{
  templates: HabitTemplate[];
}>();

const router = useRouter();
const masteryStore = useMasteryStore();

// A "slot" is only meaningful if there are still recommendations to fill it.
// If all 3 recommendations are consumed (active or paused), treat as full
// even if fewer than 3 are strictly active — so "Swap one out" shows correctly.
const hasSlot = computed(() => masteryStore.activeHabits.length < 3 && props.templates.length > 0);

const enriched = computed(() => props.templates);

const listLength = computed(() =>
  hasSlot.value ? enriched.value.length : masteryStore.activeHabits.length,
);

function goToMastery(): void {
  router.push({ name: "mastery" });
}
</script>

<template>
  <!-- Card fades + lifts in as a whole -->
  <v-card
    v-motion
    :initial="{ opacity: 0, y: 16, scale: 0.98 }"
    :enter="{
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 22 },
    }"
    variant="flat"
    rounded="xl"
    color="surface-light"
    class="overflow-hidden"
  >
    <v-list bg-color="transparent" class="py-2">
      <!-- Slot available: recommendations -->
      <template v-if="hasSlot">
        <template v-for="(t, i) in enriched" :key="t.id">
          <!-- Divider fades in between items -->
          <v-divider v-if="i > 0" />
          <v-list-item
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{
              opacity: 1,
              transition: { duration: 200, delay: 60 + i * 50 },
            }"
            density="compact"
            class="py-3"
            :ripple="false"
          >
            <template #prepend>
              <v-icon :icon="t.icon" color="secondary" size="small" />
            </template>
            <v-list-item-title class="text-body-2 text-wrap">{{ t.name }}</v-list-item-title>
          </v-list-item>
        </template>
      </template>

      <!-- Full: active habits -->
      <template v-else>
        <template v-for="(habit, i) in masteryStore.activeHabits" :key="habit.id">
          <v-divider v-if="i > 0" />
          <v-list-item
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{
              opacity: 1,
              transition: { duration: 200, delay: 60 + i * 50 },
            }"
            density="compact"
            class="py-3"
            :ripple="false"
          >
            <template #prepend>
              <v-icon icon="mdi-check-bold" color="success" size="small" class="opacity-100" />
            </template>
            <v-list-item-title class="text-body-2 text-wrap">{{ habit.name }}</v-list-item-title>
            <template #append>
              <!-- Chip bounces in last, after its row -->
              <v-chip
                v-motion
                :initial="{ opacity: 0 }"
                :enter="{
                  opacity: 1,
                  transition: { duration: 200, delay: 140 + i * 50 },
                }"
                :color="habit.streak > 0 ? 'error' : 'success'"
                variant="text"
                :prepend-icon="habit.streak > 0 ? 'mdi-fire' : 'mdi-sprout'"
                label
              >
                {{ habit.streak > 0 ? `${habit.streak}d` : "New" }}
              </v-chip>
            </template>
          </v-list-item>
        </template>
      </template>
    </v-list>

    <v-card-actions class="justify-end">
      <v-btn
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 100 + listLength * 50 },
        }"
        variant="text"
        color="primary"
        rounded="lg"
        append-icon="mdi-arrow-right"
        @click="goToMastery"
      >
        {{ hasSlot ? "Start a habit" : "Swap one out" }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
