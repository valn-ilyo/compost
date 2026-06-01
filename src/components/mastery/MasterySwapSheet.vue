<!-- Component -- swap sheet for replacing an active habit slot when at capacity -->
<script setup lang="ts">
import { computed } from "vue";
import { useDisplay } from "vuetify";
import { useMasteryStore } from "@/stores/mastery.store";
import type { HabitTemplate } from "@/types/app.types";

const props = defineProps<{
  modelValue: boolean;
  pendingTemplate: HabitTemplate | null;
  pendingAction?: "add" | "resume";
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  swap: [removeId: string];
}>();

const store = useMasteryStore();
const { mdAndUp } = useDisplay();

// ─── Computed ────────────────────────────────────────────────────────────────

// Covers every slot combination when at capacity (MAX_SLOTS = 3):
//   3 active, 0 mastered  → all 3 are swappable
//   2 active, 1 mastered  → 2 swappable; 1 mastered slot locked
//   1 active,  2 mastered → 1 swappable; 2 mastered slots locked
//   0 active,  3 mastered → nothing to swap; user must retire first
const subtitleCopy = computed<string>(() => {
  const active = store.activeHabits.length;
  const mastered = store.masteredHabits.length;
  const isResume = props.pendingAction === "resume";

  if (active === 0) {
    const n = mastered === 1 ? "1 slot is" : `${mastered} slots are`;
    return `${n} mastered. Retire one to make room for something new.`;
  }

  const swapVerb = isResume ? "pause to resume" : "replace";
  const streakNote = isResume
    ? "Resuming will restore its streak. The paused habit's streak is also preserved."
    : "Its streak will be paused, not deleted.";

  if (mastered === 0) {
    return `You have 3 active habits. Choose one to ${swapVerb}. ${streakNote}`;
  }

  const masteredLabel = mastered === 1 ? "1 mastered habit" : `${mastered} mastered habits`;
  const swappableLabel = active === 1 ? "1 habit" : `${active} habits`;
  return `${swappableLabel} can be swapped. ${masteredLabel} occupy the other ${
    mastered === 1 ? "slot" : "slots"
  }. Retire ${mastered === 1 ? "it" : "one"} to free up more room. ${streakNote}`;
});

const closeBtnLabel = "Close";

// ─── Actions ─────────────────────────────────────────────────────────────────

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
    <v-card
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } }"
      rounded="t-xl"
    >
      <v-card-title
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 60 },
        }"
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
        {{ subtitleCopy }}
      </v-card-subtitle>

      <v-divider />

      <v-list-item
        v-for="(habit, i) in store.activeHabits"
        :key="habit.id"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 200, delay: 140 + i * 60 } }"
        class="align-start"
        @click="confirmSwap(habit.templateId)"
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

      <v-card-actions
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{
          opacity: 1,
          transition: { duration: 200, delay: 140 + store.activeHabits.length * 60 },
        }"
        class="pa-4 pt-2"
      >
        <v-btn block variant="tonal" rounded="lg" @click="close">
          {{ closeBtnLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>
