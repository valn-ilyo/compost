<!-- Component -- habit recommendations panel, adapts to slot state and mastery store -->
<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useMasteryStore } from "@/stores/mastery.store";
import { MAX_SLOTS } from "@/types/app.types";
import type { HabitTemplate, HabitPanelItem } from "@/types/app.types";

const props = defineProps<{
  templates: HabitTemplate[];
  hasPausedRecs?: boolean;
}>();

const router = useRouter();
const masteryStore = useMasteryStore();

const hasSlot = computed(() => masteryStore.usedSlots < MAX_SLOTS && props.templates.length > 0);
const isEmpty = computed(() => props.templates.length === 0 && masteryStore.usedSlots < MAX_SLOTS);

const items = computed((): HabitPanelItem[] => {
  if (isEmpty.value) {
    if (props.hasPausedRecs) {
      return [
        {
          key: "paused",
          icon: "mdi-play",
          iconColor: "warning",
          name: "Your recommended habits are paused. Resume them in Habits whenever you're ready.",
        },
      ];
    }
    return [
      {
        key: "empty",
        icon: "mdi-check-circle-outline",
        iconColor: "success",
        name: "Your habits are strong where it counts. Browse the library to go further.",
      },
    ];
  }
  if (hasSlot.value) {
    return props.templates.map((t) => ({
      key: t.id,
      icon: t.icon,
      iconColor: "secondary",
      name: t.name,
    }));
  }
  return masteryStore.activeHabits.map((h) => ({
    key: h.id,
    icon: "mdi-check-bold",
    iconColor: "success",
    name: h.name,
    chip: {
      color: h.streak > 0 ? "error" : "success",
      icon: h.streak > 0 ? "mdi-fire" : "mdi-sprout",
      label: h.streak > 0 ? `${h.streak}d` : "New",
    },
  }));
});

const btnLabel = computed(() => {
  if (isEmpty.value) return props.hasPausedRecs ? "Go to Habits" : "Explore";
  return hasSlot.value ? "Start a habit" : "Swap one out";
});

function goToMastery(): void {
  router.push({ name: "mastery" });
}
</script>

<template>
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
      <template v-for="(item, i) in items" :key="item.key">
        <v-divider v-if="i > 0" />
        <v-list-item
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { duration: 200, delay: 60 + i * 50 } }"
          density="compact"
          class="py-3"
          :ripple="false"
        >
          <template #prepend>
            <v-icon :icon="item.icon" :color="item.iconColor" class="opacity-100" />
          </template>
          <v-list-item-title class="text-body-2 text-wrap">{{ item.name }}</v-list-item-title>
          <template v-if="item.chip" #append>
            <v-chip
              v-motion
              :initial="{ opacity: 0 }"
              :enter="{ opacity: 1, transition: { duration: 200, delay: 140 + i * 50 } }"
              :color="item.chip.color"
              :prepend-icon="item.chip.icon"
              variant="text"
              label
            >
              {{ item.chip.label }}
            </v-chip>
          </template>
        </v-list-item>
      </template>
    </v-list>

    <v-card-actions class="justify-end">
      <v-btn
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 22,
            delay: 100 + items.length * 50,
          },
        }"
        variant="text"
        color="primary"
        rounded="lg"
        append-icon="mdi-arrow-right"
        @click="goToMastery"
      >
        {{ btnLabel }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
