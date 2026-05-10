<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useDisplay } from "vuetify";
import { useMasteryStore } from "@/stores/mastery";
import type { UserHabit } from "@/types/app";

const props = defineProps<{
  modelValue: boolean;
  habitId?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  done: [];
}>();

const store = useMasteryStore();
const { mdAndUp } = useDisplay();

const session = ref<UserHabit[]>([]);
const idx = ref(0);
const answered = ref(false);
const navDirection = ref<"forward" | "back">("forward");

const current = computed(() => session.value[idx.value] ?? null);
const isLast = computed(() => idx.value === session.value.length - 1);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      session.value = props.habitId
        ? store.activeHabits.filter((h) => h.id === props.habitId)
        : [...store.unloggedToday];
      idx.value = 0;
      answered.value = false;
      navDirection.value = "forward";
    }
  },
);

function answer(didIt: boolean): void {
  if (!current.value || answered.value) return;
  answered.value = true;
  store.logHabit(current.value.id, didIt);
  setTimeout(() => {
    if (isLast.value) {
      close();
      emit("done");
    } else {
      navDirection.value = "forward";
      idx.value++;
      answered.value = false;
    }
  }, 300);
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
      :initial="{ opacity: 0, y: 24 }"
      :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } }"
      rounded="t-xl"
      :style="{ display: 'flex', flexDirection: 'column', minHeight: mdAndUp ? '230px' : '260px' }"
    >
      <v-card-title class="pb-0">
        <v-progress-linear
          v-if="session.length > 1"
          :model-value="idx + 1"
          :max="session.length"
          :chunk-count="session.length"
          color="primary"
          bg-color="surface-variant"
          rounded="b"
        />
      </v-card-title>
      <v-card-text class="py-0 mt-0" style="flex: 1; overflow: hidden">
        <p
          v-if="current"
          :key="idx"
          v-motion
          :initial="{ opacity: 0, y: navDirection === 'forward' ? -16 : 16, scale: 0.97 }"
          :enter="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 60 },
          }"
          class="text-title-large"
        >
          {{ current.prompt }}
        </p>
      </v-card-text>
      <v-card-actions class="flex-column ga-3 pa-4 pt-0">
        <v-btn
          :key="`yes-${idx}`"
          v-motion
          :initial="{ opacity: 0, y: 12, scale: 0.95 }"
          :enter="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 140 },
          }"
          block
          size="large"
          color="primary"
          variant="tonal"
          rounded="lg"
          :disabled="answered"
          @click="answer(true)"
        >
          Yes
        </v-btn>
        <v-btn
          :key="`no-${idx}`"
          v-motion
          :initial="{ opacity: 0, y: 12, scale: 0.95 }"
          :enter="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 210 },
          }"
          block
          size="large"
          color="error"
          variant="tonal"
          rounded="lg"
          :disabled="answered"
          @click="answer(false)"
        >
          No
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>
