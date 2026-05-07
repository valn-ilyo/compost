import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabaseClient";

export function useNotificationPrompt() {
  const showNotificationBanner = ref(false);
  const debugLog = ref<string[]>([]);

  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

  function log(msg: string) {
    console.log("[push]", msg);
    debugLog.value.push(msg);
  }

  function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0))).buffer;
  }

  async function subscribeAndSave(): Promise<void> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      log("ERROR: serviceWorker or PushManager not available");
      return;
    }

    if (!VAPID_PUBLIC_KEY) {
      log("ERROR: VITE_VAPID_PUBLIC_KEY is not set");
      return;
    }

    log("VAPID key present: " + VAPID_PUBLIC_KEY.slice(0, 12) + "...");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      log("ERROR: no authenticated user");
      return;
    }

    log("user: " + userData.user.id);

    try {
      log("waiting for SW...");
      const registration = await navigator.serviceWorker.ready;
      log("SW ready, subscribing...");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      log("subscribed to push");

      const json = subscription.toJSON();
      const endpoint = json.endpoint;
      const p256dh = json.keys?.["p256dh"];
      const auth = json.keys?.["auth"];

      if (!endpoint || !p256dh || !auth) {
        log("ERROR: subscription missing keys");
        return;
      }

      log("upserting to supabase...");

      const { error } = await supabase
        .from("push_subscriptions")
        .upsert({ user_id: userData.user.id, endpoint, p256dh, auth }, { onConflict: "endpoint" });

      if (error) {
        log("ERROR: upsert failed: " + error.message);
      } else {
        log("SUCCESS: subscription saved");
      }
    } catch (err: unknown) {
      log("ERROR: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function requestPermission(): Promise<void> {
    if (!("Notification" in window)) {
      log("ERROR: Notification API not available");
      return;
    }

    log("requesting permission...");

    try {
      const permission = await Notification.requestPermission();
      log("permission result: " + permission);
      showNotificationBanner.value = false;

      if (permission === "granted") {
        await subscribeAndSave();
      }
    } catch (err: unknown) {
      log("ERROR: requestPermission threw: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  onMounted(async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      log("ERROR: Notification or SW not supported");
      return;
    }

    log("onMounted: waiting for SW...");
    await navigator.serviceWorker.ready;
    log("onMounted: SW ready, permission=" + Notification.permission);

    const permission = Notification.permission;

    if (permission === "default") {
      showNotificationBanner.value = true;
    } else if (permission === "granted") {
      log("onMounted: already granted, re-subscribing...");
      subscribeAndSave().catch((err) => log("ERROR: " + String(err)));
    }
  });

  return { showNotificationBanner, debugLog, requestPermission };
}
