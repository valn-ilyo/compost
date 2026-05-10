import type { BeforeInstallPromptEvent } from "@/types/app.types";

declare global {
  interface Window {
    __pwaInstallPrompt: BeforeInstallPromptEvent | null;
  }
}

window.__pwaInstallPrompt = null;
window.addEventListener(
  "beforeinstallprompt",
  (e) => {
    e.preventDefault();
    window.__pwaInstallPrompt = e as BeforeInstallPromptEvent;
  },
  { once: true },
);

import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;
    setInterval(
      () => {
        registration.update().catch(() => {});
      },
      60 * 60 * 1000,
    ); // check for a new SW every hour
  },
});

import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as labsComponents from "vuetify/labs/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css";
import { md3 } from "vuetify/blueprints";
import { theme } from "./styles/theme.ts";

import App from "./App.vue";
import router from "./router";

import { h } from "vue";
import sacIcon from "@/components/icons/sacIcon.vue";
import type { IconProps } from "vuetify";

import { MotionPlugin } from "@vueuse/motion";

const app = createApp(App);

const vuetify = createVuetify({
  components: { ...components, ...labsComponents },
  directives,
  blueprint: md3,
  theme,
  icons: {
    defaultSet: "mdi",
    sets: {
      custom: {
        component: (_props: IconProps) => h(sacIcon),
      },
    },
  },
});

app.use(createPinia().use(piniaPluginPersistedstate));
app.use(router);
app.use(vuetify);
app.use(MotionPlugin);

app.mount("#app");
