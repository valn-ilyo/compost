<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  freezeCount: number;
  freezeCap: number;
  daysToNextFreeze: number | null;
  anyFreezeUsed: boolean;
}>();

const inDebt = computed(() => props.freezeCount < 0);
const isOverflow = computed(() => props.freezeCount > props.freezeCap);

const btnColor = computed(() => {
  if (inDebt.value) return "error";
  return "info";
});
const btnIcon = computed(() => (inDebt.value ? "mdi-snowflake-alert" : "mdi-snowflake"));
const cardIcon = computed(() => btnIcon.value);
const cardIconColor = computed(() => btnColor.value);

const cardTitle = computed(() => {
  if (isOverflow.value) return "Bonus freeze";
  if (!inDebt.value) return "Streak Freezes";
  return props.anyFreezeUsed ? "Streak Debt" : "Still in Debt";
});

const progressionLabel = computed(() => {
  if (isOverflow.value) return null;
  if (props.daysToNextFreeze === null) return null;
  if (props.daysToNextFreeze === 0) return "Log today to earn one";
  if (inDebt.value) {
    return props.freezeCount === -1 ? "Debt clears in" : "Debt reduces in";
  }
  return "Next freeze in";
});

const daysLabel = computed(() => {
  if (props.daysToNextFreeze === null) return null;
  return props.daysToNextFreeze === 1 ? "1 day" : `${props.daysToNextFreeze} days`;
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
        <v-icon :icon="cardIcon" :color="cardIconColor" size="small" class="mr-2" />
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
        <!-- Situation 1: overflow → goal completion pushed past the cap -->
        <template v-if="isOverflow">
          A 66-day habit is done. Your pool was already full, so the cap bent. Spend the extra on
          any active habit.
        </template>

        <!-- Situation 2: no debt → explain how freezes work -->
        <template v-else-if="!inDebt">
          A freeze covers you if you miss a day completely. Logging No still counts, so your streak
          holds. Yes logs earn new freezes: one every 22 days.
        </template>

        <!-- Situation 3: in debt AND freeze fired today → streaks just saved on credit -->
        <template v-else-if="anyFreezeUsed">
          Your streaks were saved on credit. They were tied, so all of them got covered even though
          you were short. Keep logging Yes: every 22 days earns one back.
        </template>

        <!-- Situation 4: in debt but no freeze used today → debt carried over from before -->
        <template v-else>
          You're in debt from a missed day before this one. Nothing hit today, it's carried over.
          Log Yes consistently and each new freeze chips away at it.
        </template>
      </v-card-text>

      <v-divider />

      <v-card-text
        v-if="daysToNextFreeze !== null"
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
          v-if="daysToNextFreeze > 0"
          :color="inDebt ? 'info' : 'error'"
          variant="tonal"
          size="small"
          :prepend-icon="inDebt ? 'mdi-trending-up' : 'mdi-fire'"
          class="font-weight-bold"
        >
          {{ daysLabel }}
        </v-chip>
        <v-icon v-else icon="mdi-check-circle" color="success" />
      </v-card-text>
    </v-card>
  </v-menu>
</template>
