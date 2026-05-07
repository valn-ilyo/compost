/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

// Activate immediately and take control of all tabs — no waiting for old SW to
// be unloaded. This is the fix for long-lived TWA sessions seeing stale assets.
self.skipWaiting();
clientsClaim();

// Precache every asset Vite emitted (JS, CSS, HTML, icons, fonts, SVGs…)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// SPA fallback — serve index.html from the precache for all navigation requests
// so deep links and refreshes work offline and after updates.
const handler = createHandlerBoundToURL("/compost/index.html");
registerRoute(new NavigationRoute(handler));

// ─── Push notifications ───────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title: string = data.title ?? "Compost";
  const body: string = data.body ?? "Time to log your habits.";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/compost/pwa-192x192.png",
      badge: "/compost/pwa-64x64.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = "/compost/mastery?action=log";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If the app is already open, focus it and navigate.
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          (client as WindowClient).navigate(target);
          return;
        }
      }
      // Otherwise open a new window.
      self.clients.openWindow(target);
    }),
  );
});
