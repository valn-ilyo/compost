import { ref, onMounted, onBeforeUnmount } from "vue";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

const STORAGE_KEY = "pwa-installable";

// Module-level so the event survives composable unmount/remount within the
// same page session (e.g. navigating away and back to HomeView).
let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function usePwaInstall() {
  const isPwa = ref(false);
  const isIos = ref(false);
  const installPrompt = ref<BeforeInstallPromptEvent | null>(deferredPrompt);
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

  function evaluateBanner(): void {
    if (isInStandaloneMode() || !isMobile()) return;

    if (isIos.value) {
      showInstallBanner.value = true;
      return;
    }

    // Show banner if we have a live prompt OR Chrome told us it was
    // installable in a previous session.
    if (installPrompt.value || localStorage.getItem(STORAGE_KEY) === "true") {
      showInstallBanner.value = true;
    }
  }

  function handleBeforeInstallPrompt(e: Event): void {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    installPrompt.value = deferredPrompt;
    localStorage.setItem(STORAGE_KEY, "true");
    evaluateBanner();
  }

  async function triggerInstall(): Promise<void> {
    if (!installPrompt.value) return;

    try {
      await installPrompt.value.prompt();
      const { outcome } = await installPrompt.value.userChoice;

      if (outcome === "accepted") {
        deferredPrompt = null;
        installPrompt.value = null;
        showInstallBanner.value = false;
        localStorage.removeItem(STORAGE_KEY);
      }
      // If dismissed, keep the flag — Chrome may allow another attempt later.
    } catch {
      // prompt() threw — the event is stale (e.g. app was installed another
      // way, or too much time passed). Clear everything.
      deferredPrompt = null;
      installPrompt.value = null;
      showInstallBanner.value = false;
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  onMounted(() => {
    isPwa.value = isInStandaloneMode();
    if (isPwa.value) return; // already installed, nothing to do

    if (isMobile() && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      isIos.value = true;
    }

    // Sync module-level prompt into the ref in case it was captured before
    // this composable instance mounted (e.g. event fired on a different view).
    if (deferredPrompt) {
      installPrompt.value = deferredPrompt;
    }

    evaluateBanner();

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  });

  return { isPwa, isIos, installPrompt, showInstallBanner, triggerInstall };
}
