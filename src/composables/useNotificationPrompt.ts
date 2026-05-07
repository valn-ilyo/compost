import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabaseClient";

/**
 * Encapsulates web push permission, subscription, and Supabase upsert logic.
 *
 * Returns reactive state and handlers ready to bind in the template:
 * - `showNotificationBanner` — whether the enable-reminders banner should be visible
 * - `requestPermission()`    — asks for notification permission and subscribes the device
 */
export function useNotificationPrompt() {
  const showNotificationBanner = ref(false);

  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

  /** Convert a base64url VAPID public key to a Uint8Array for pushManager.subscribe. */
  function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0))).buffer;
  }

  /** Subscribe the device and upsert the subscription to Supabase. */
  async function subscribeAndSave(): Promise<void> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const json = subscription.toJSON();
    const endpoint = json.endpoint;
    const p256dh = json.keys?.["p256dh"];
    const auth = json.keys?.["auth"];

    if (!endpoint || !p256dh || !auth) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase
      .from("push_subscriptions")
      .upsert({ user_id: userData.user.id, endpoint, p256dh, auth }, { onConflict: "endpoint" });
  }

  /**
   * Called by the banner's "Enable reminders" button.
   * Requests permission then subscribes. Hides the banner on success or denial.
   *
   * NOTE: do not add any `await` before `Notification.requestPermission()` here.
   * Chrome on Android requires the call to be synchronous within the user gesture.
   * The SW is guaranteed ready by the time this can be called (see onMounted).
   */
  async function requestPermission(): Promise<void> {
    if (!("Notification" in window)) return;

    try {
      const permission = await Notification.requestPermission();
      showNotificationBanner.value = false;

      if (permission === "granted") {
        await subscribeAndSave();
      }
    } catch (err) {
      // Permission request failed (e.g. SW not ready, browser policy).
      // Leave the banner visible so the user can try again.
      console.error("[push] requestPermission failed:", err);
    }
  }

  onMounted(async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    // Wait for the service worker to be active and controlling the page before
    // showing the banner. Chrome on Android silently drops Notification.requestPermission()
    // if the SW isn't ready yet — this ensures it's ready by the time the user taps.
    await navigator.serviceWorker.ready;

    const permission = Notification.permission;

    if (permission === "default") {
      // Not asked yet — show the banner so the user can opt in with intent.
      showNotificationBanner.value = true;
    } else if (permission === "granted") {
      // Already granted — silently re-subscribe in case the device changed
      // (reinstall, cleared site data, new browser). Fire and forget.
      subscribeAndSave().catch(() => {});
    }
    // 'denied' — do nothing, never show the banner.
  });

  return { showNotificationBanner, requestPermission };
}
