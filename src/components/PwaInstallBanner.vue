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
  >
    <!-- Android: native prompt -->
    <template v-if="hasInstallPrompt">
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-cellphone-arrow-down" color="secondary" />
        </template>
        <v-card-title>
          <div class="text-label-small text-uppercase">Get the app</div>
          <div class="text-title-large mb-1">Install Compost</div>
        </v-card-title>
      </v-card-item>
    </template>

    <!-- iOS: manual Add to Home Screen -->
    <template v-else-if="isIos">
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-apple" color="secondary" />
        </template>
        <v-card-title>
          <div class="text-label-small text-uppercase">Get the app</div>
          <div class="text-title-large mb-1">Add to Home Screen</div>
        </v-card-title>
      </v-card-item>
    </template>

    <v-card-text v-if="isIos && !hasInstallPrompt" class="pt-0">
      <!-- iOS steps -->
      <v-list density="compact" bg-color="transparent" class="pa-0 mt-2">
        <v-list-item class="px-0" min-height="28">
          <template #prepend>
            <span class="text-body-medium text-on-secondary-container mr-3">1.</span>
          </template>
          <v-list-item-title class="text-body-medium text-on-secondary-container text-wrap">
            Tap <v-icon size="14" icon="mdi-export-variant" /> <strong>Share</strong> in Safari
          </v-list-item-title>
        </v-list-item>
        <v-list-item class="px-0" min-height="28">
          <template #prepend>
            <span class="text-body-medium text-on-secondary-container mr-3">2.</span>
          </template>
          <v-list-item-title class="text-body-medium text-on-secondary-container text-wrap">
            Tap <strong>Add to Home Screen</strong>
          </v-list-item-title>
        </v-list-item>
        <v-list-item class="px-0" min-height="28">
          <template #prepend>
            <span class="text-body-medium text-on-secondary-container mr-3">3.</span>
          </template>
          <v-list-item-title class="text-body-medium text-on-secondary-container text-wrap">
            Tap <strong>Add</strong>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>

    <v-card-actions v-if="hasInstallPrompt">
      <v-spacer />
      <v-btn variant="flat" rounded="lg" color="secondary" @click="$emit('install')">
        Install
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  hasInstallPrompt: boolean;
  isIos: boolean;
}>();

defineEmits<{
  install: [];
}>();
</script>
