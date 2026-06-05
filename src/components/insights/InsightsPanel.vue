<!-- Component -- five-question insight list with affirmation colouring -->
<script setup lang="ts">
import type { QuestionInsight } from '@/types/app.types'

defineProps<{
  insights: QuestionInsight[]
}>()
</script>

<template>
  <v-card variant="flat" rounded class="overflow-hidden">
    <v-list lines="two" bg-color="transparent" class="py-1">
      <v-list-item
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
          <v-icon :icon="insight.icon" :color="insight.score >= 4 ? 'success' : undefined" />
        </template>
        <v-list-item-title
          class="text-body-2 text-wrap font-weight-medium mb-1"
          :class="{ 'text-success': insight.score >= 4 }"
        >
          {{ insight.text }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>
