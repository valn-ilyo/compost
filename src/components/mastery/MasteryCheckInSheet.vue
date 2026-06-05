<!-- Component -- check-in bottom sheet for logging yes/no on unlogged active habits -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useMasteryStore } from '@/stores/mastery.store'
import type { UserHabit } from '@/types/app.types'

const props = defineProps<{
  modelValue: boolean
  habitId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  done: []
}>()

const store = useMasteryStore()
const { mdAndUp } = useDisplay()

const session = ref<UserHabit[]>([])
const idx = ref(0)
const isAnswered = ref(false)
const navDirection = ref<'forward' | 'back'>('forward')

// Buffered answers: templateId → 'yes' | 'no'. Flushed to the store on close.
const pendingAnswers = ref<Map<string, 'yes' | 'no'>>(new Map())

const current = computed(() => session.value[idx.value] ?? null)
const isLast = computed(() => idx.value === session.value.length - 1)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      session.value = props.habitId
        ? store.activeHabits.filter((h) => h.templateId === props.habitId)
        : [...store.unloggedToday]
      idx.value = 0
      isAnswered.value = false
      navDirection.value = 'forward'
      pendingAnswers.value = new Map()
    }
  },
)

function answer(didIt: boolean): void {
  if (!current.value || isAnswered.value) return
  isAnswered.value = true
  pendingAnswers.value.set(current.value.templateId, didIt ? 'yes' : 'no')
  setTimeout(() => {
    if (isLast.value) {
      close()
      emit('done')
    } else {
      navDirection.value = 'forward'
      idx.value++
      isAnswered.value = false
    }
  }, 300)
}

function close(): void {
  for (const [templateId, value] of pendingAnswers.value) {
    store.logHabit(templateId, value)
  }
  pendingAnswers.value = new Map()
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
      v-motion
      :initial="{ opacity: 0, y: 24 }"
      :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } }"
      rounded="t-xl"
      :style="{ display: 'flex', flexDirection: 'column', minHeight: mdAndUp ? '230px' : '260px' }"
    >
      <VCardTitle class="pb-0">
        <VProgressLinear
          v-if="session.length > 1"
          :model-value="idx + 1"
          :max="session.length"
          :chunk-count="session.length"
          color="primary"
          bg-color="surface-variant"
          rounded="b"
        />
      </VCardTitle>
      <VCardText class="py-0 mt-0" style="flex: 1; overflow: hidden">
        <p
          v-if="current"
          :key="idx"
          v-motion
          :initial="{ opacity: 0, y: navDirection === 'forward' ? -16 : 16, scale: 0.97 }"
          :enter="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 60 },
          }"
          class="text-title-large"
        >
          {{ current.prompt }}
        </p>
      </VCardText>
      <VCardActions class="flex-column ga-3 pa-4 pt-0">
        <VBtn
          :key="`yes-${idx}`"
          v-motion
          :initial="{ opacity: 0, y: 12, scale: 0.95 }"
          :enter="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 140 },
          }"
          block
          size="large"
          color="primary"
          variant="tonal"
          rounded="lg"
          :disabled="isAnswered"
          @click="answer(true)"
        >
          Yes
        </VBtn>
        <VBtn
          :key="`no-${idx}`"
          v-motion
          :initial="{ opacity: 0, y: 12, scale: 0.95 }"
          :enter="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 210 },
          }"
          block
          size="large"
          color="error"
          variant="tonal"
          rounded="lg"
          :disabled="isAnswered"
          @click="answer(false)"
        >
          No
        </VBtn>
      </VCardActions>
    </VCard>
  </VBottomSheet>
</template>
