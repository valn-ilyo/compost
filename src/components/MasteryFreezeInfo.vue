<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  freezeCount: number;
  freezeCap: number;
  daysToNextFreeze: number | null;
}>();

const inDebt = computed(() => props.freezeCount < 0);

const btnColor = computed(() => (inDebt.value ? "error" : "info"));
const btnIcon = computed(() => (inDebt.value ? "mdi-snowflake-alert" : "mdi-snowflake"));
const cardIcon = computed(() => (inDebt.value ? "mdi-snowflake-alert" : "mdi-snowflake"));
const cardIconColor = computed(() => (inDebt.value ? "error" : "info"));
const cardTitle = computed(() => (inDebt.value ? "Streak Debt" : "Streak Freezes"));

const progressionLabel = computed(() => {
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
        variant="tonal"
        :color="btnColor"
        :prepend-icon="btnIcon"
        rounded="pill"
        density="comfortable"
      >
        {{ freezeCount }} / {{ freezeCap }}
      </v-btn>
    </template>

    <!--
      Card drops in from above when the menu opens.
      Children cascade: title → body → footer row.
    -->
    <v-card
      v-motion
      :initial="{ opacity: 0, y: -8, scale: 0.97 }"
      :enter="{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 22 } }"
      width="260"
      rounded="lg"
    >
      <v-card-title
        v-motion
        :initial="{ opacity: 0, x: -8 }"
        :enter="{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 60 } }"
        class="text-subtitle-1 pt-4 font-weight-bold"
      >
        <v-icon :icon="cardIcon" :color="cardIconColor" size="small" class="mr-2" />
        {{ cardTitle }}
      </v-card-title>

      <v-card-text
        v-motion
        :initial="{ opacity: 0, y: 6 }"
        :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 100 } }"
        class="text-body-2 text-medium-emphasis pb-4"
      >
        <!-- Render as two spans so <strong> works without v-html -->
        <template v-if="inDebt">
          Your streaks were saved on credit. They were tied, so the system covered all of them even
          though you were short on freezes. Keep logging Yes to earn freezes and clear the balance.
        </template>
        <template v-else>
          A freeze covers you if you miss a day completely. Logging No still counts as showing up,
          so your streak holds. Only Yes logs earn new freezes: one for every 14 days of consistent
          progress.
        </template>
      </v-card-text>

      <v-divider />

      <v-card-text
        v-if="daysToNextFreeze !== null"
        v-motion
        :initial="{ opacity: 0, y: 6 }"
        :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 140 } }"
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
