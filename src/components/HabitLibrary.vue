<script setup lang="ts">
import { computed, ref } from "vue";
import { HABIT_TEMPLATES } from "@/data/habits";
import { useMasteryStore } from "@/stores/mastery";
import HabitListItem from "@/components/HabitListItem.vue";

const props = defineProps<{
  recommendedIds?: string[];
}>();

const store = useMasteryStore();
const showAll = ref(false);
const expandedId = ref<string | null>(null);

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}

const templates = computed(() =>
  HABIT_TEMPLATES.map((t) => {
    return {
      ...t,
      isActive: store.activeTemplateIds.has(t.id),
      isPaused: store.pausedTemplateIds.has(t.id),
      isMastered: store.masteredTemplateIds.has(t.id),
      isRecommended: props.recommendedIds?.includes(t.id) ?? false,
      pausedHabit: store.pausedHabits.find((h) => h.templateId === t.id) ?? null,
    };
  }),
);

const grouped = computed(() => ({
  mastered: store.masteredArchive
    .map((entry) => templates.value.find((t) => t.id === entry.templateId))
    .filter((t): t is (typeof templates.value)[number] => t !== undefined),
  paused: templates.value.filter((t) => t.isPaused),
  recommended: templates.value.filter(
    (t) => t.isRecommended && !t.isPaused && !t.isActive && !t.isMastered,
  ),
  available: templates.value.filter(
    (t) => !t.isPaused && !t.isActive && !t.isRecommended && !t.isMastered,
  ),
  active: templates.value.filter((t) => t.isActive),
}));

const emit = defineEmits<{
  add: [templateId: string];
  resume: [habitId: string];
}>();

function formatStreak(days: number): string {
  if (days < 7) return `${days}-day`;
  if (days < 30) return `${Math.floor(days / 7)}-week`;
  if (days < 365) return `${Math.floor(days / 30)}-month`;
  return `${Math.floor(days / 365)}-year`;
}
</script>

<template>
  <v-card
    v-motion
    :initial="{ opacity: 0, scale: 0.97, y: 20 }"
    :enter="{
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 22 },
    }"
    rounded="xl"
    color="surface-light"
    flat
    class="overflow-hidden"
  >
    <v-card-item
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{
        opacity: 1,
        transition: { duration: 200, delay: 80 },
      }"
      class="pt-4 px-4 pb-0"
    >
      <v-card-title class="text-center">Habit Library</v-card-title>
    </v-card-item>

    <v-list lines="two" bg-color="transparent" class="pt-2">
      <!-- paused -->
      <template v-if="grouped.paused.length">
        <v-list-subheader
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{
            opacity: 1,
            transition: { duration: 200, delay: 120 },
          }"
          class="mt-1"
        >
          Pick up where you left off
        </v-list-subheader>

        <template v-for="(t, i) in grouped.paused" :key="t.id">
          <v-divider v-if="i > 0" />
          <HabitListItem
            :delay="160 + i * 70"
            :habit="t"
            :is-expanded="expandedId === t.id"
            icon-color="warning"
            action-icon="mdi-play"
            action-color="warning"
            outlined
            border-class="border-s-4 border-warning mb-1"
            :subtitle="`${formatStreak(t.pausedHabit!.streak)} streak saved`"
            @toggle="toggleExpand(t.id)"
            @action="emit('resume', t.pausedHabit!.id)"
          />
        </template>
      </template>

      <!-- recommendations -->
      <template v-if="grouped.recommended.length">
        <v-list-subheader
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{
            opacity: 1,
            transition: { duration: 200, delay: 160 + grouped.paused.length * 70 + 60 },
          }"
          :class="grouped.paused.length ? 'mt-3' : 'mt-1'"
        >
          Recommendations
        </v-list-subheader>

        <template v-for="(t, i) in grouped.recommended" :key="t.id">
          <v-divider v-if="i > 0" />
          <HabitListItem
            :delay="200 + grouped.paused.length * 70 + i * 70"
            :habit="t"
            :is-expanded="expandedId === t.id"
            icon-color="info"
            action-icon="mdi-plus"
            action-color="info"
            outlined
            @toggle="toggleExpand(t.id)"
            @action="emit('add', t.id)"
          />
        </template>
      </template>

      <!-- available (first 3) -->
      <template v-if="grouped.available.length">
        <v-list-subheader
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{
            opacity: 1,
            transition: {
              duration: 200,
              delay: 160 + grouped.paused.length * 70 + grouped.recommended.length * 70 + 60,
            },
          }"
          :class="grouped.paused.length || grouped.recommended.length ? 'mt-3' : 'mt-1'"
        >
          Fresh starts
        </v-list-subheader>

        <template v-for="(t, i) in grouped.available.slice(0, 3)" :key="t.id">
          <v-divider v-if="i > 0" />
          <HabitListItem
            :delay="200 + grouped.paused.length * 70 + grouped.recommended.length * 70 + i * 70"
            :habit="t"
            :is-expanded="expandedId === t.id"
            icon-color="info"
            action-icon="mdi-plus"
            action-color="info"
            outlined
            @toggle="toggleExpand(t.id)"
            @action="emit('add', t.id)"
          />
        </template>
      </template>

      <!-- available (overflow) + active -->
      <v-expand-transition>
        <div v-if="showAll" class="overflow-hidden">
          <template v-for="(t, i) in grouped.available.slice(3)" :key="t.id">
            <v-divider />
            <HabitListItem
              :delay="i * 60"
              :habit="t"
              :is-expanded="expandedId === t.id"
              icon-color="info"
              action-icon="mdi-plus"
              action-color="info"
              outlined
              @toggle="toggleExpand(t.id)"
              @action="emit('add', t.id)"
            />
          </template>

          <template v-if="grouped.mastered.length">
            <v-list-subheader
              v-motion
              :initial="{ opacity: 0 }"
              :enter="{
                opacity: 1,
                transition: { duration: 200, delay: grouped.available.slice(3).length * 60 + 40 },
              }"
              class="mt-3"
            >
              Mastered
            </v-list-subheader>

            <template v-for="(t, i) in grouped.mastered" :key="t.id">
              <v-divider v-if="i > 0" />
              <HabitListItem
                :delay="grouped.available.slice(3).length * 60 + 80 + i * 60"
                :habit="t"
                :is-expanded="expandedId === t.id"
                icon-color="success"
                action-icon="mdi-star-shooting"
                action-color="success"
                expand-color="success"
                item-color="success"
                :action-disabled="true"
                @toggle="toggleExpand(t.id)"
                @action="() => {}"
              />
            </template>
          </template>

          <template v-if="grouped.active.length">
            <v-list-subheader
              v-motion
              :initial="{ opacity: 0 }"
              :enter="{
                opacity: 1,
                transition: { duration: 200, delay: grouped.available.slice(3).length * 60 + 40 },
              }"
              class="mt-3"
            >
              Your active habits
            </v-list-subheader>

            <template v-for="(t, i) in grouped.active" :key="t.id">
              <v-divider v-if="i > 0" />
              <HabitListItem
                :delay="grouped.available.slice(3).length * 60 + 80 + i * 60"
                :habit="t"
                :is-expanded="expandedId === t.id"
                icon-color="success"
                action-icon="mdi-check"
                action-color="success"
                :action-disabled="true"
                @toggle="toggleExpand(t.id)"
                @action="() => {}"
              />
            </template>
          </template>
        </div>
      </v-expand-transition>
    </v-list>

    <v-card-actions
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 22, delay: 400 },
      }"
      class="px-4 pb-4 pt-0"
    >
      <v-btn
        class="ml-auto"
        variant="text"
        color="primary"
        :append-icon="showAll ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        @click="showAll = !showAll"
      >
        {{ showAll ? "Show less" : `See all ${templates.length}` }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
