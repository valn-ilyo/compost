<!-- Component -- expandable habit list item with icon, subtitle, toggle, and action button -->
<script setup lang="ts">
import type { HabitTemplate } from '@/types/app.types'

defineProps<{
  habit: HabitTemplate & {
    icon: string
    iconOutline: string
    pausedHabit?: { id: string; streak: number } | null
  }
  isExpanded: boolean
  iconColor: string
  actionIcon: string
  actionColor: string
  actionDisabled?: boolean
  outlined?: boolean
  subtitle?: string
  borderClass?: string
  delay?: number
  expandColor?: string
}>()

const emit = defineEmits<{
  toggle: []
  action: []
}>()
</script>

<template>
  <VListItem
    v-motion
    :initial="{ opacity: 0 }"
    :enter="{
      opacity: 1,
      transition: { duration: 200, delay: delay ?? 0 },
    }"
    density="compact"
    :class="borderClass"
  >
    <template #prepend>
      <VIcon
        :icon="outlined ? habit.iconOutline : habit.icon"
        :color="iconColor"
        size="small"
        class="opacity-100"
      />
    </template>

    <template #title>
      <span class="text-wrap">{{ habit.name }}</span>
    </template>

    <template v-if="subtitle" #subtitle>
      <span class="text-medium-emphasis">{{ subtitle }}</span>
    </template>

    <template #append>
      <div class="d-flex align-center">
        <VIcon
          :icon="isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          size="small"
          color="info"
          class="align-self-center"
          @click.stop="emit('toggle')"
        />
        <VBtn
          :icon="actionIcon"
          :color="actionColor"
          variant="text"
          :style="actionDisabled ? 'pointer-events: none' : ''"
          @click.stop="emit('action')"
        />
      </div>
    </template>
  </VListItem>

  <VExpandTransition>
    <VCard
      v-if="isExpanded"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{
        opacity: 1,
        transition: { duration: 200, delay: 30 },
      }"
      variant="tonal"
      :color="expandColor ?? 'info'"
      rounded="lg"
      class="mx-3 mb-3"
      style="transform-origin: top center"
    >
      <VList density="compact" bg-color="transparent">
        <VListItem>
          <VListItemTitle class="text-wrap">
            <span class="font-weight-bold">When: </span>{{ habit.when }}
          </VListItemTitle>
        </VListItem>
        <VListItem>
          <VListItemTitle class="text-wrap">
            <span class="font-weight-bold">Tip: </span>{{ habit.instruction }}
          </VListItemTitle>
        </VListItem>
      </VList>
    </VCard>
  </VExpandTransition>
</template>
