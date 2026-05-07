import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabaseClient";

export function useNotificationPrompt() {
  const showNotificationBanner = ref(false);

  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

  function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0))).buffer;
  }

  async function subscribeAndSave(): Promise<void> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!VAPID_PUBLIC_KEY) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    try {
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

      await supabase
        .from("push_subscriptions")
        .upsert({ user_id: userData.user.id, endpoint, p256dh, auth }, { onConflict: "endpoint" });
    } catch {
      // subscription failed silently — user can retry via the banner
    }
  }

  async function requestPermission(): Promise<void> {
    if (!("Notification" in window)) return;

    try {
      const permission = await Notification.requestPermission();
      showNotificationBanner.value = false;

      if (permission === "granted") {
        await subscribeAndSave();
      }
    } catch {
      // permission request failed — banner stays visible for retry
    }
  }

  onMounted(async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    await navigator.serviceWorker.ready;

    if (Notification.permission === "default") {
      showNotificationBanner.value = true;
    } else if (Notification.permission === "granted") {
      subscribeAndSave().catch(() => {});
    }
  });

  return { showNotificationBanner, requestPermission };
}
