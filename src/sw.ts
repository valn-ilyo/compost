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
