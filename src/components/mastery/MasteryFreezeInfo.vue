<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  freezeCount: number;
  freezeCap: number;
  daysToNextFreeze: number | null;
  daysToNextMastery: number | null;
  anyFreezeUsed: boolean;
  masteredToday: boolean;
}>();

const inDebt = computed(() => props.freezeCount < 0);
const isOverflow = computed(() => props.freezeCount > props.freezeCap);
const atCap = computed(
  () => !inDebt.value && !isOverflow.value && props.freezeCount === props.freezeCap,
);

const btnColor = computed(() => (inDebt.value ? "error" : "info"));
const btnIcon = computed(() => (inDebt.value ? "mdi-snowflake-alert" : "mdi-snowflake"));

const cardTitle = computed(() => {
  if (isOverflow.value) return "Freeze overflow";
  if (!inDebt.value) return "Streak freeze";
  return "Freeze debt";
});

const progressionLabel = computed(() => {
  if (isOverflow.value) {
    if (props.daysToNextMastery === null) return null;
    return "Next freeze in";
  }
  if (props.daysToNextFreeze === null) return null;
  if (inDebt.value) {
    return props.freezeCount === -1 ? "Debt clears in" : "Debt reduces in";
  }
  return "Next freeze in";
});

const daysLabel = computed(() => {
  if (isOverflow.value) {
    if (props.daysToNextMastery === null) return null;
    return props.daysToNextMastery === 1 ? "1 day" : `${props.daysToNextMastery} days`;
  }
  if (props.daysToNextFreeze === null) return null;
  return props.daysToNextFreeze === 1 ? "1 day" : `${props.daysToNextFreeze} days`;
});

const showProgressRow = computed(() => {
  if (isOverflow.value) return props.daysToNextMastery !== null;
  return props.daysToNextFreeze !== null;
});
</script>

<template>
  <v-menu location="bottom end" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        :variant="isOverflow ? 'flat' : 'tonal'"
        :color="btnColor"
        :prepend-icon="btnIcon"
        rounded="pill"
        density="comfortable"
      >
        {{ freezeCount }} / {{ freezeCap }}
      </v-btn>
    </template>

    <v-card
      v-motion
      :initial="{ opacity: 0, y: -8, scale: 0.97 }"
      :enter="{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 22 },
      }"
      width="260"
      rounded="lg"
    >
      <v-card-title
        v-motion
        :initial="{ opacity: 0, x: -8 }"
        :enter="{
          opacity: 1,
          x: 0,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 60 },
        }"
        class="text-subtitle-1 pt-4 font-weight-bold"
      >
        <v-icon :icon="btnIcon" :color="btnColor" size="small" class="mr-2" />
        {{ cardTitle }}
      </v-card-title>

      <v-card-text
        v-motion
        :initial="{ opacity: 0, y: 6 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 100 },
        }"
        class="text-body-2 text-medium-emphasis pb-4"
      >
        <!-- Overflow, mastery fired today: present-tense event -->
        <template v-if="isOverflow && masteredToday">
          Mastering a habit earned a freeze, but the pool was full so it pushed past the cap.
          <strong>Yes</strong> logs won't earn more while you're over it. Master another habit to
          earn the next one.
        </template>

        <!-- Overflow, ongoing state: eternal description -->
        <template v-else-if="isOverflow">
          You have more freezes than the cap. <strong>Yes</strong> logs won't add to the pool while
          you're over it. Master another habit to earn the next one.
        </template>

        <!-- No debt: normal state -->
        <template v-else-if="!inDebt">
          A freeze covers you if you miss a day completely. Logging <strong>No</strong> still
          counts, so your streak holds. <strong>Yes</strong> logs earn new freezes: one every 22
          days.
          <template v-if="atCap">
            Your pool is full. New ones won't be added until you've used one.
          </template>
        </template>

        <!-- In debt, freeze fired today -->
        <template v-else-if="anyFreezeUsed">
          Your streaks were saved on credit. They were tied, so all of them got covered even though
          you were short. Keep logging <strong>Yes</strong>: every 22 days earns one back.
        </template>

        <!-- In debt, carried over -->
        <template v-else>
          You're in debt from a missed day before this one. Nothing hit today, it's carried over.
          Log <strong>Yes</strong> consistently and each new freeze chips away at it.
        </template>
      </v-card-text>

      <v-divider />

      <v-card-text
        v-if="showProgressRow"
        v-motion
        :initial="{ opacity: 0, y: 6 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 140 },
        }"
        class="d-flex align-center justify-space-between py-3"
      >
        <span class="text-caption font-weight-medium">{{ progressionLabel }}</span>
        <v-chip
          v-if="showProgressRow"
          color="error"
          variant="tonal"
          size="small"
          prepend-icon="mdi-fire"
          class="font-weight-bold"
        >
          {{ daysLabel }}
        </v-chip>
        <v-icon v-else icon="mdi-check-circle" color="success" />
      </v-card-text>
    </v-card>
  </v-menu>
</template>
