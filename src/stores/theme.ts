import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useTheme } from 'vuetify'

export const useThemeStore = defineStore('theme', () => {
  const vTheme = useTheme()
  // This ref will be persisted
  const currentTheme = ref(vTheme.global.name.value)

  // Derive the base (light/dark) and contrast level from currentTheme
  const isDark = computed(() => currentTheme.value.startsWith('dark'))

  const contrastLevel = computed<'low' | 'medium' | 'high'>(() => {
    if (currentTheme.value.endsWith('-high-contrast'))   return 'high'
    if (currentTheme.value.endsWith('-medium-contrast')) return 'medium'
    return 'low'
  })

  const contrastIcon = computed(() => {
    if (contrastLevel.value === 'high')   return 'mdi-brightness-5'  // next: low
    if (contrastLevel.value === 'medium') return 'mdi-brightness-7'  // next: high
    return 'mdi-brightness-6'                                         // next: medium
  })

  const contrastLabel = computed(() => {
    if (contrastLevel.value === 'high')   return 'Low contrast'      // next: low
    if (contrastLevel.value === 'medium') return 'High contrast'     // next: high
    return 'Medium contrast'                                          // next: medium
  })

  // Function to toggle dark/light, preserving contrast level
  function toggleTheme() {
    const base = isDark.value ? 'light' : 'dark'
    const suffix = contrastLevel.value === 'high'
      ? '-high-contrast'
      : contrastLevel.value === 'medium'
        ? '-medium-contrast'
        : ''
    currentTheme.value = `${base}${suffix}`
  }

  // Cycle contrast: low → medium → high → low, preserving dark/light base
  function cycleContrast() {
    const base = isDark.value ? 'dark' : 'light'
    const next =
      contrastLevel.value === 'low'    ? 'medium' :
      contrastLevel.value === 'medium' ? 'high'   : 'low'
    const suffix = next === 'high'
      ? '-high-contrast'
      : next === 'medium'
        ? '-medium-contrast'
        : ''
    currentTheme.value = `${base}${suffix}`
  }

  // Watch for changes and apply to Vuetify
  watch(currentTheme, (newTheme) => {
    vTheme.change(newTheme)
  }, { immediate: true })

  return { currentTheme, contrastLevel, contrastIcon, contrastLabel, toggleTheme, cycleContrast }
}, {
  persist: true // This tells the plugin to save this store to localStorage
})
