<script setup lang="ts">
import { useDisplay } from "vuetify";
import { useMasteryStore } from "@/stores/mastery";
import type { HabitTemplate } from "@/types/app.types";

// ─── Props / emits ────────────────────────────────────────────────────────────
defineProps<{
  modelValue: boolean;
  pendingTemplate: HabitTemplate | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  swap: [removeId: string];
}>();

// ─── Store / display ──────────────────────────────────────────────────────────
const store = useMasteryStore();
const { mdAndUp } = useDisplay();

// ─── Actions ──────────────────────────────────────────────────────────────────
function confirmSwap(removeId: string): void {
  emit("swap", removeId);
  emit("update:modelValue", false);
}

function close(): void {
  emit("update:modelValue", false);
}
</script>

<template>
  <v-bottom-sheet
    :model-value="modelValue"
    :max-width="mdAndUp ? '50%' : undefined"
    @update:model-value="close"
  >
    <!--
      Small y offset + short duration — slides up from the bottom edge rather
      than dropping in. Keeps it feeling native to a bottom sheet.
    -->
    <v-card
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } }"
      rounded="t-xl"
    >
      <v-card-title
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 60 } }"
        class="pt-5 px-4"
      >
        Swap a habit
      </v-card-title>

      <v-card-subtitle
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 200, delay: 100 } }"
        class="px-4 pb-4 text-wrap"
      >
        You have 3 active habits. Choose one to replace. Any streak it has will be paused, not
        deleted.
      </v-card-subtitle>

      <v-divider />

      <!-- Items stagger in from the left, one after another. -->
      <v-list-item
        v-for="(habit, i) in store.activeHabits"
        :key="habit.id"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 200, delay: 140 + i * 60 } }"
        class="align-start"
        @click="confirmSwap(habit.id)"
      >
        <template #prepend>
          <v-icon
            :icon="habit.streak > 0 ? 'mdi-fire' : 'mdi-sprout'"
            :color="habit.streak > 0 ? 'error' : 'success'"
            class="opacity-100"
          />
        </template>
        <template #title>
          <span class="text-wrap">{{ habit.name }}</span>
        </template>
        <template #append>
          <div class="d-flex align-center gap-2">
            <v-chip v-if="habit.streak > 0" size="small" color="error" variant="tonal" class="ma-1">
              {{ habit.streak }}d
            </v-chip>
            <v-icon icon="mdi-swap-horizontal" color="info" />
          </div>
        </template>
      </v-list-item>

      <!-- Cancel fades in after the last item settles. -->
      <v-card-actions
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{
          opacity: 1,
          transition: { duration: 200, delay: 140 + store.activeHabits.length * 60 },
        }"
        class="pa-4 pt-2"
      >
        <v-btn block variant="tonal" rounded="lg" @click="close">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>
