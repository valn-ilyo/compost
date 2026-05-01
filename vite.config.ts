import { VitePWA } from "vite-plugin-pwa";

import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
//import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from "vite-plugin-vuetify";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    //vueDevTools(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        // Remove precache entries from old SW versions when a new one activates,
        // preventing stale assets from being served after an update.
        cleanupOutdatedCaches: true,
        // Serve index.html from the SW precache for all navigation requests.
        // This means the SW — not the browser HTTP cache — controls which
        // index.html the user sees, so updates land as soon as the new SW activates.
        navigateFallback: "/compost/index.html",
      },
      manifest: {
        name: "Compost",
        short_name: "Compost",
        theme_color: "#0C6B59",
        background_color: "#F5FBF7",
        display: "standalone",
        start_url: "/compost/",
        scope: "/compost/",

        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "monochrome",
          },
        ],
      },
    }),
    vuetify({
      styles: {
        configFile: "src/styles/settings.scss",
      },
    }),
  ],
  base: "/compost/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
