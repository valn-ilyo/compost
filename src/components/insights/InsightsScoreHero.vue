<!-- Component -- score ring, badge chip, and tagline hero card -->
<script setup lang="ts">
defineProps<{
  normalized: number
  normalizedOutOf: number
  ringValue: number
  color: string
  badgeColor: string
  badgeLabel: string
  tagline: string
}>()
</script>

<template>
  <VCard
    v-motion
    :initial="{ opacity: 0, y: 32 }"
    :enter="{
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 22 },
    }"
    rounded="xl"
    elevation="0"
  >
    <VRow align="center" justify="center" no-gutters>
      <VCol cols="12" md="auto" class="d-flex justify-center pa-6">
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.55 }"
          :enter="{
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 120 },
          }"
        >
          <VProgressCircular
            reveal
            :bg-color="color"
            :color="color"
            :model-value="ringValue"
            :size="140"
            :width="13"
          >
            <div class="d-flex align-baseline justify-center">
              <span class="text-headline-large font-weight-bold">{{ normalized }}</span>
              <span class="text-title-large text-medium-emphasis">/{{ normalizedOutOf }}</span>
            </div>
          </VProgressCircular>
        </div>
      </VCol>

      <VCol
        cols="12"
        md=""
        class="d-flex flex-column align-center align-md-start pa-6 pt-0 pt-md-6"
      >
        <VChip
          v-motion
          :initial="{ opacity: 0, scale: 0.6, y: -10 }"
          :enter="{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 440, damping: 22, delay: 240 },
          }"
          :color="badgeColor"
          variant="tonal"
          size="default"
          rounded="pill"
        >
          {{ badgeLabel }}
        </VChip>

        <p
          v-motion
          :initial="{ opacity: 0, y: 14 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 360 },
          }"
          class="text-center text-md-left text-medium-emphasis mt-4 mb-0"
        >
          {{ tagline }}
        </p>
      </VCol>
    </VRow>
  </VCard>
</template>

<style scoped>
:deep(.v-progress-circular__underlay) {
  opacity: 0.15;
  stroke: currentColor;
}
</style>
