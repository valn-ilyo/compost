<!-- Component -- banner card prompting the user to enable daily push reminders -->
<script setup lang="ts">
defineProps<{
  show: boolean;
}>();

defineEmits<{
  enable: [];
}>();
</script>

<template>
  <v-card
    v-if="show"
    v-motion
    :initial="{ opacity: 0, y: 16, scale: 0.97 }"
    :enter="{
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 22, delay: 160 },
    }"
    color="secondary-container"
    variant="flat"
    rounded
    density="compact"
  >
    <v-card-item>
      <template #prepend>
        <v-icon icon="mdi-bell-outline" color="secondary" />
      </template>
      <v-card-title class="text-title-large">Daily reminder</v-card-title>
    </v-card-item>

    <v-card-text class="py-0 my-0 text-body-medium text-on-secondary-container">
      A nudge at 6:30 PM if you haven't logged for the day.
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn variant="flat" rounded="lg" color="secondary" @click="$emit('enable')">
        Turn on
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
