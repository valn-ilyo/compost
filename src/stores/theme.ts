import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useTheme } from "vuetify";

export const useThemeStore = defineStore(
  "theme",
  () => {
    const vTheme = useTheme();
    const currentTheme = ref(vTheme.global.name.value);

    const isDark = computed(() => currentTheme.value.startsWith("dark"));

    const contrastLevel = computed<"low" | "medium" | "high">(() => {
      if (currentTheme.value.endsWith("-high-contrast")) return "high";
      if (currentTheme.value.endsWith("-medium-contrast")) return "medium";
      return "low";
    });

    const contrastIcon = computed(() => {
      if (contrastLevel.value === "high") return "mdi-brightness-5";
      if (contrastLevel.value === "medium") return "mdi-brightness-7";
      return "mdi-brightness-6";
    });

    const contrastLabel = computed(() => {
      if (contrastLevel.value === "high") return "Low contrast";
      if (contrastLevel.value === "medium") return "High contrast";
      return "Medium contrast";
    });

    function toggleTheme() {
      const base = isDark.value ? "light" : "dark";
      const suffix =
        contrastLevel.value === "high"
          ? "-high-contrast"
          : contrastLevel.value === "medium"
            ? "-medium-contrast"
            : "";
      currentTheme.value = `${base}${suffix}`;
    }

    function cycleContrast() {
      const base = isDark.value ? "dark" : "light";
      const next =
        contrastLevel.value === "low"
          ? "medium"
          : contrastLevel.value === "medium"
            ? "high"
            : "low";
      const suffix =
        next === "high" ? "-high-contrast" : next === "medium" ? "-medium-contrast" : "";
      currentTheme.value = `${base}${suffix}`;
    }

    watch(
      currentTheme,
      (newTheme) => {
        vTheme.change(newTheme);
      },
      { immediate: true },
    );

    return { currentTheme, contrastLevel, contrastIcon, contrastLabel, toggleTheme, cycleContrast };
  },
  {
    persist: true,
  },
);
