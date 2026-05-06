import { ref, onMounted, onBeforeUnmount } from "vue";
import type { BeforeInstallPromptEvent, NavigatorWithStandalone } from "@/types/app.types";

/**
 * Encapsulates all PWA install-prompt and standalone-mode detection logic.
 *
 * Returns reactive state and handlers ready to bind in the template:
 * - `isPwa`             — whether the app is running in standalone/installed mode
 * - `isIos`            — whether the device is iOS (needs manual Add to Home Screen)
 * - `installPrompt`    — the captured beforeinstallprompt event (null on iOS / unsupported)
 * - `showInstallBanner`— whether the install banner should be visible
 * - `triggerInstall()` — calls the native install prompt and handles the outcome
 */
export function usePwaInstall() {
  const isPwa = ref(false);
  const isIos = ref(false);
  const installPrompt = ref<BeforeInstallPromptEvent | null>(null);
  const showInstallBanner = ref(false);

  function isMobile(): boolean {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function isInStandaloneMode(): boolean {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as NavigatorWithStandalone).standalone === true
    );
  }

  function handleBeforeInstallPrompt(e: Event): void {
    e.preventDefault();
    installPrompt.value = e as BeforeInstallPromptEvent;
    if (isMobile() && !isInStandaloneMode()) {
      showInstallBanner.value = true;
    }
  }

  async function triggerInstall(): Promise<void> {
    const prompt = installPrompt.value;
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      showInstallBanner.value = false;
      installPrompt.value = null;
    }
  }

  onMounted(() => {
    isPwa.value = isInStandaloneMode();
    if (isMobile() && /iPhone|iPad|iPod/i.test(navigator.userAgent) && !isInStandaloneMode()) {
      isIos.value = true;
      showInstallBanner.value = true;
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  });

  return { isPwa, isIos, installPrompt, showInstallBanner, triggerInstall };
}