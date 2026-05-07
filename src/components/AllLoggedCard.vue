<template>
  <v-card
    v-motion
    :initial="{ opacity: 0, y: 28, scale: 0.96 }"
    :enter="{
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 22, delay: 80 },
    }"
    color="primary-container"
    variant="flat"
    rounded
    prepend-icon="mdi-check-decagram"
  >
    <template #title>
      <div class="text-title-large mb-1">All logged for today</div>
    </template>
  </v-card>
</template>
