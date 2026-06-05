<!-- Component -- five-question insight list with affirmation colouring -->
<script setup lang="ts">
import type { QuestionInsight } from '@/types/app.types'

defineProps<{
  insights: QuestionInsight[]
}>()
</script>

<template>
  <VCard variant="flat" rounded class="overflow-hidden">
    <VList lines="two" bg-color="transparent" class="py-1">
      <VListItem
        v-for="(insight, i) in insights"
        :key="`${insight.sectionId}-${insight.questionId}`"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{
          opacity: 1,
          transition: {
            duration: 200,
            delay: 100 + i * 90,
          },
        }"
        class="py-3"
      >
        <template #prepend>
          <VIcon :icon="insight.icon" :color="insight.score >= 4 ? 'success' : undefined" />
        </template>
        <VListItemTitle
          class="text-body-2 text-wrap font-weight-medium mb-1"
          :class="{ 'text-success': insight.score >= 4 }"
        >
          {{ insight.text }}
        </VListItemTitle>
      </VListItem>
    </VList>
  </VCard>
</template>
