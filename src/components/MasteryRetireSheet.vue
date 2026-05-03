<script setup lang="ts">
import { useDisplay } from "vuetify";
import type { UserHabit } from "@/types/app.types";

// ─── Props / emits ────────────────────────────────────────────────────────────

defineProps<{
  modelValue: boolean;
  habit: UserHabit | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  retire: [id: string];
}>();

// ─── Display ──────────────────────────────────────────────────────────────────

const { mdAndUp } = useDisplay();

// ─── Actions ──────────────────────────────────────────────────────────────────

function confirmRetire(id: string): void {
  emit("retire", id);
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
    <v-card
      v-if="habit"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } }"
      rounded="t-xl"
    >
      <v-card-item
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 60 },
        }"
        class="pt-5 px-4 pb-1"
      >
        <template #prepend>
          <v-avatar color="primary" variant="tonal" size="x-large" rounded="lg">
            <v-icon :icon="habit.icon" size="x-large" />
          </v-avatar>
        </template>

        <v-card-title class="text-body-1 font-weight-bold">
          {{ habit.name }}
        </v-card-title>

        <v-card-subtitle>
          {{ habit.streak }}-day streak, mastered. Time to move on.
        </v-card-subtitle>
      </v-card-item>

      <v-card-actions
        v-motion
        :initial="{ opacity: 0, y: 12, scale: 0.95 }"
        :enter="{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 140 },
        }"
        class="pa-4 pt-3"
      >
        <v-btn
          block
          size="large"
          color="success"
          variant="tonal"
          rounded="lg"
          @click="confirmRetire(habit.id)"
          append-icon="mdi-star-shooting"
        >
          Retire
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>
