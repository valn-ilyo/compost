<!-- Component -- banner card prompting the user to enable daily push reminders -->
<script setup lang="ts">
defineProps<{
  show: boolean
}>()

defineEmits<{
  enable: []
}>()
</script>

<template>
  <VCard
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
    <VCardItem>
      <template #prepend>
        <VIcon icon="mdi-bell-outline" color="secondary" />
      </template>
      <VCardTitle class="text-title-large">Daily reminder</VCardTitle>
    </VCardItem>

    <VCardText class="py-0 my-0 text-body-medium text-on-secondary-container">
      A nudge at 6:30 PM if you haven't logged for the day.
    </VCardText>

    <VCardActions>
      <VSpacer />
      <VBtn variant="flat" rounded="lg" color="secondary" @click="$emit('enable')">
        Turn on
      </VBtn>
    </VCardActions>
  </VCard>
</template>
