<!-- Component -- habit card with streak chip, log action, pause/remove menu, and mastery retire sheet -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UserHabit } from '@/types/app.types'
import MasteryRetireSheet from '@/components/mastery/MasteryRetireSheet.vue'

const props = defineProps<{
  habit: UserHabit
  isLoggedToday: boolean
  lostStreak?: number
}>()

const emit = defineEmits<{
  pause: [id: string]
  remove: [id: string]
  log: [id: string]
  retire: [id: string]
}>()

const isConfirmRemoveOpen = ref(false)
const isRetireSheetOpen = ref(false)

const streakChip = computed(() => {
  if (props.habit.isMastered) {
    const days = props.habit.streak
    const unit = days === 1 ? 'day' : 'days'
    return {
      icon: 'mdi-star-shooting',
      color: 'primary',
      label: `${days}-${unit} streak, mastered`,
    }
  }
  const days = props.lostStreak ?? props.habit.streak
  const unit = days === 1 ? 'day' : 'days'
  if (props.lostStreak !== undefined && !props.isLoggedToday)
    return {
      icon: 'mdi-fire-off',
      color: 'error',
      label: `${days}-${unit} streak ended`,
    }
  if (props.habit.streak === 0)
    return { icon: 'mdi-sprout', color: 'success', label: 'Start your streak' }
  return props.habit.freezeUsed
    ? {
        icon: 'mdi-snowflake',
        color: 'info',
        label: `${days}-${unit} streak, frozen`,
      }
    : { icon: 'mdi-fire', color: 'error', label: `${days}-${unit} streak` }
})

function handleRemoveClick(): void {
  if (props.habit.streak > 0) {
    isConfirmRemoveOpen.value = true
  } else {
    emit('remove', props.habit.templateId)
  }
}
</script>

<template>
  <VListItem
    density="compact"
    min-height="0"
    class="py-3"
    :ripple="habit.isMastered || !isLoggedToday"
    @click="
      habit.isMastered
        ? (isRetireSheetOpen = true)
        : !isLoggedToday && emit('log', habit.templateId)
    "
  >
    <template #prepend>
      <VIcon
        v-motion
        :initial="{ opacity: 0, x: -10 }"
        :enter="{
          opacity: 1,
          x: 0,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 60 },
        }"
        :icon="isLoggedToday ? 'mdi-check-decagram' : habit.icon"
        :color="habit.isMastered ? 'primary' : isLoggedToday ? 'primary' : 'secondary'"
        size="x-large"
      />
    </template>

    <template #title>
      <span
        v-motion
        :initial="{ opacity: 0, y: 6 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 100 },
        }"
        class="text-wrap font-weight-medium"
        >{{ habit.name }}</span
      >
    </template>

    <template v-if="streakChip" #subtitle>
      <VChip
        v-motion
        :initial="{ opacity: 0, y: 6 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 22, delay: 150 },
        }"
        :color="streakChip.color"
        :prepend-icon="streakChip.icon"
        variant="text"
        class="text-wrap"
      >
        {{ streakChip.label }}
      </VChip>
    </template>

    <!-- No menu for mastered habits - tap the card instead -->
    <template v-if="!habit.isMastered" #append>
      <VMenu location="bottom end">
        <template #activator="{ props: menuProps }">
          <VBtn
            v-bind="menuProps"
            icon="mdi-dots-vertical"
            variant="text"
            density="compact"
            size="small"
            color="on-surface-variant"
            @click.stop
          />
        </template>
        <VList density="compact" rounded="lg">
          <VListItem
            v-if="habit.streak > 0"
            title="Pause"
            prepend-icon="mdi-pause"
            rounded="lg"
            base-color="warning"
            @click="emit('pause', habit.templateId)"
          />
          <VListItem
            title="Remove"
            prepend-icon="mdi-close"
            rounded="lg"
            base-color="error"
            @click="handleRemoveClick"
          />
        </VList>
      </VMenu>
    </template>
  </VListItem>

  <!-- Retirement bottom sheet - mastered habits only -->
  <MasteryRetireSheet v-model="isRetireSheetOpen" :habit="habit" @retire="emit('retire', $event)" />

  <!-- Confirmation dialog - only reachable when habit.streak > 0 -->
  <VDialog v-model="isConfirmRemoveOpen" max-width="320">
    <VCard rounded="xl">
      <VCardItem class="pt-5 pb-1">
        <template #prepend>
          <VIcon icon="mdi-fire" color="error" />
        </template>
        <VCardTitle class="text-body-1 font-weight-bold">
          Drop your {{ habit.streak }}-day streak?
        </VCardTitle>
      </VCardItem>

      <VCardText class="text-body-2 text-medium-emphasis">
        This deletes the streak for good. Pause it instead if you might come back.
      </VCardText>

      <VCardActions class="px-4 pb-4 gap-2">
        <VBtn
          variant="text"
          color="error"
          rounded="lg"
          flex="1"
          @click="emit('remove', habit.templateId); isConfirmRemoveOpen = false"
        >
          Remove
        </VBtn>
        <VBtn
          variant="flat"
          color="primary"
          rounded="lg"
          flex="1"
          @click="isConfirmRemoveOpen = false"
        >
          Keep it
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
:deep(.v-list-item-subtitle) {
  opacity: 1 !important;
}
</style>
