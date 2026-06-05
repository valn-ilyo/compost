// Composable -- PWA install prompt capture, iOS detection, and install trigger
import { ref, onMounted } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import type { BeforeInstallPromptEvent, NavigatorWithStandalone } from '@/types/app.types'

const isPwa = ref(false)
const isIos = ref(false)
const installPrompt = ref<BeforeInstallPromptEvent | null>(null)
const showInstallBanner = ref(false)

// Reactive standalone detection; updates automatically if the user installs
// the app mid-session, unlike a one-shot matchMedia().matches call.
const isStandaloneMediaQuery = useMediaQuery('(display-mode: standalone)')

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function isInStandaloneMode(): boolean {
  return isStandaloneMediaQuery.value || (navigator as NavigatorWithStandalone).standalone === true
}

function handleBeforeInstallPrompt(e: Event): void {
  e.preventDefault()
  installPrompt.value = e as BeforeInstallPromptEvent
  if (isMobile() && !isInStandaloneMode()) {
    showInstallBanner.value = true
  }
}

let initialized = false

function init(): void {
  if (initialized) return
  initialized = true

  isPwa.value = isInStandaloneMode()

  if (isMobile() && /iPhone|iPad|iPod/i.test(navigator.userAgent) && !isInStandaloneMode()) {
    isIos.value = true
    showInstallBanner.value = true
  }

  const early = window.__pwaInstallPrompt
  if (early) {
    installPrompt.value = early
    window.__pwaInstallPrompt = null
    if (isMobile() && !isInStandaloneMode()) {
      showInstallBanner.value = true
    }
  }

  // Permanent listener; not tied to any component lifecycle.
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
}

export function usePwaInstall() {
  onMounted(init)

  async function triggerInstall(): Promise<void> {
    const prompt = installPrompt.value
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      showInstallBanner.value = false
      installPrompt.value = null
    }
  }

  return { isPwa, isIos, installPrompt, showInstallBanner, triggerInstall }
}
