// Pinia store -- clock bar visibility toggle with persistence
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useClockVisibleStore = defineStore(
  'clockVisible',
  () => {
    const clockVisible = ref(false)

    function toggleClock() {
      clockVisible.value = !clockVisible.value
    }

    return { clockVisible, toggleClock }
  },
  { persist: true },
)
