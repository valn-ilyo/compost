// Composable -- push notification permission flow and subscription persistence
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase.service'

export function useNotificationPrompt() {
  const showNotificationBanner = ref(false)

  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

  function vapidKeyToArrayBuffer(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const raw = atob(base64)
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0))).buffer as ArrayBuffer
  }

  async function subscribeAndSave(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (!VAPID_PUBLIC_KEY) return

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    try {
      const registration = await navigator.serviceWorker.ready

      // Reuse an existing subscription if one exists; avoids throwing when
      // subscribe() is called again with the same VAPID key. If the VAPID key
      // has rotated, getSubscription() returns null and we create a fresh one.
      const existing = await registration.pushManager.getSubscription()
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKeyToArrayBuffer(VAPID_PUBLIC_KEY),
        }))

      const json = subscription.toJSON()
      const endpoint = json.endpoint
      const p256dh = json.keys?.['p256dh']
      const auth = json.keys?.['auth']

      if (!endpoint || !p256dh || !auth) return

      // Upsert on (user_id, endpoint); one row per user per device.
      // If the browser rotates p256dh/auth for the same endpoint, the row is
      // updated in place. A new device gets its own row.
      await supabase
        .from('push_subscriptions')
        .upsert(
          { user_id: userData.user.id, endpoint, p256dh, auth },
          { onConflict: 'user_id,endpoint' },
        )
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[push] subscribeAndSave failed', e)
      // subscription failed silently in prod; user can retry via the banner
    }
  }

  async function requestPermission(): Promise<void> {
    if (!('Notification' in window)) return

    try {
      const permission = await Notification.requestPermission()

      if (permission === 'granted') {
        showNotificationBanner.value = false
        await subscribeAndSave()
      } else if (permission === 'denied') {
        // The system dialog was suppressed or the user explicitly denied.
        // Hide the banner; there is nothing more the app can do.
        showNotificationBanner.value = false
      }
      // "default" (dismissed without choosing): leave the banner visible for retry.
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[push] requestPermission failed', e)
      // permission request failed; banner stays visible for retry
    }
  }

  onMounted(async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    await navigator.serviceWorker.ready

    if (Notification.permission === 'default') {
      showNotificationBanner.value = true
    } else if (Notification.permission === 'granted') {
      // Re-run on every mount to keep the stored subscription fresh in case
      // the browser rotated the push subscription since the last session.
      subscribeAndSave().catch((e) => {
        if (import.meta.env.DEV) console.warn('[push] subscribeAndSave failed on mount', e)
      })
    }
  })

  return { showNotificationBanner, requestPermission }
}
