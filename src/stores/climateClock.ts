import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NewsfeedItem, Lifeline } from '@/types/app'

export const useClockVisibleStore = defineStore('clockVisible', () => {
  const clockVisible = ref(false)

  function toggleClock() {
    clockVisible.value = !clockVisible.value
  }

  return { clockVisible, toggleClock }
}, { persist: true })

export const useClockDataStore = defineStore('clockData', () => {
  const deadlineTs    = ref<string | null>(null)
  const deadlineLabel = ref('Time left to limit global warming to 1.5°C')
  const lifelines     = ref<Lifeline[]>([])
  const tickerItems   = ref<NewsfeedItem[]>([])
  const cachedAt      = ref<number | null>(null)

  const CACHE_TTL = 24 * 60 * 60 * 1000

  const isCacheValid = computed(() =>
    cachedAt.value !== null && Date.now() - cachedAt.value < CACHE_TTL
  )

  return { deadlineTs, deadlineLabel, lifelines, tickerItems, cachedAt, isCacheValid }
}, { persist: true })
