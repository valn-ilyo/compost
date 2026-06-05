<!-- Component -- retire sheet confirming mastered habit removal from an active slot -->
<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { UserHabit } from '@/types/app.types'

defineProps<{
  modelValue: boolean
  habit: UserHabit | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  retire: [id: string]
}>()

const { mdAndUp } = useDisplay()

function confirmRetire(id: string): void {
  emit('retire', id)
  emit('update:modelValue', false)
}

function close(): void {
  emit('update:modelValue', false)
}
</script>

<template>
  <VBottomSheet
    :model-value="modelValue"
    :max-width="mdAndUp ? '50%' : undefined"
    @update:model-value="close"
  >
    <VCard
      v-if="habit"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } }"
      rounded="t-xl"
    >
      <VCardItem
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 60 },
        }"
        class="pt-5 px-4 pb-1"
      >
        <template #prepend>
          <VAvatar color="primary" variant="tonal" size="x-large" rounded="lg">
            <VIcon :icon="habit.icon" size="x-large" />
          </VAvatar>
        </template>

        <VCardTitle class="text-body-1 font-weight-bold">
          {{ habit.name }}
        </VCardTitle>

        <VCardSubtitle>
          {{ habit.streak }}-day streak, mastered. Time to move on.
        </VCardSubtitle>
      </VCardItem>

      <VCardActions
        v-motion
        :initial="{ opacity: 0, y: 12, scale: 0.95 }"
        :enter="{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 140 },
        }"
        class="pa-4 pt-3"
      >
        <VBtn
          block
          size="large"
          color="success"
          variant="tonal"
          rounded="lg"
          append-icon="mdi-star-shooting"
          @click="confirmRetire(habit.templateId)"
        >
          Retire
        </VBtn>
      </VCardActions>
    </VCard>
  </VBottomSheet>
</template>
