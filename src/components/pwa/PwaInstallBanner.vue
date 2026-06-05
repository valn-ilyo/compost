<!-- Component -- install banner for Android native prompt and iOS Add to Home Screen flow -->
<script setup lang="ts">
defineProps<{
  show: boolean
  hasInstallPrompt: boolean
  isIos: boolean
}>()

defineEmits<{
  install: []
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
    <!-- Android: native prompt -->
    <template v-if="hasInstallPrompt">
      <VCardItem>
        <template #prepend>
          <VIcon icon="mdi-cellphone-arrow-down" color="secondary" />
        </template>
        <VCardTitle>
          <div class="text-label-small text-uppercase">Get the app</div>
          <div class="text-title-large">Install Compost</div>
        </VCardTitle>
      </VCardItem>
    </template>

    <!-- iOS: manual Add to Home Screen -->
    <template v-else-if="isIos">
      <VCardItem class="pb-0">
        <template #prepend>
          <VIcon icon="mdi-apple" color="secondary" />
        </template>
        <VCardTitle>
          <div class="text-label-small text-uppercase">Get the app</div>
          <div class="text-title-large">Add to Home Screen</div>
        </VCardTitle>
      </VCardItem>
    </template>

    <VCardText v-if="isIos && !hasInstallPrompt" class="pt-0">
      <!-- iOS steps -->
      <VList density="compact" bg-color="transparent" class="pa-0 mt-2">
        <VListItem class="px-0" min-height="28">
          <template #prepend>
            <span class="text-body-medium text-on-secondary-container mr-3">1.</span>
          </template>
          <VListItemTitle class="text-body-medium text-on-secondary-container text-wrap">
            Tap <VIcon size="14" icon="mdi-export-variant" /> <strong>Share</strong> in Safari
          </VListItemTitle>
        </VListItem>
        <VListItem class="px-0" min-height="28">
          <template #prepend>
            <span class="text-body-medium text-on-secondary-container mr-3">2.</span>
          </template>
          <VListItemTitle class="text-body-medium text-on-secondary-container text-wrap">
            Tap <strong>Add to Home Screen</strong>
          </VListItemTitle>
        </VListItem>
        <VListItem class="px-0" min-height="28">
          <template #prepend>
            <span class="text-body-medium text-on-secondary-container mr-3">3.</span>
          </template>
          <VListItemTitle class="text-body-medium text-on-secondary-container text-wrap">
            Tap <strong>Add</strong>
          </VListItemTitle>
        </VListItem>
      </VList>
    </VCardText>

    <VCardActions v-if="hasInstallPrompt">
      <VSpacer />
      <VBtn variant="flat" rounded="lg" color="secondary" @click="$emit('install')">
        Install
      </VBtn>
    </VCardActions>
  </VCard>
</template>
