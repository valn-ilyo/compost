<!-- Component -- section score breakdown bars with icon and colour per section -->
<script setup lang="ts">
defineProps<{
  sections: Array<{
    id: string
    label: string
    icon: string
    barValue: number
    color: string
  }>
}>()
</script>

<template>
  <VRow density="comfortable">
    <VCol
      v-for="(s, i) in sections"
      :key="s.id"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 22, delay: 100 + i * 70 },
      }"
      cols="6"
    >
      <VListItem density="compact" class="px-0 mb-1">
        <VListItemTitle>
          <VIcon :icon="s.icon" :color="s.color" />
          {{ s.label }}
        </VListItemTitle>
      </VListItem>
      <VProgressLinear
        :model-value="s.barValue"
        :color="s.color"
        :bg-color="s.color"
        bg-opacity="0.15"
        rounded
        height="8"
      />
    </VCol>
  </VRow>
</template>
