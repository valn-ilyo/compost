<!--
  UI COPY GUIDELINES

  Voice: Honest Friend with clear eyes. Warm, direct, never preachy.
  The app wants users to feel capable, not just feel good.

  TONE RULES
  - Short sentences. No corporate-speak.
  - Contractions always: "you're" not "you are", "can't" not "cannot"
  - No exclamation marks except very sparingly — they lose value fast
  - No em dashes — use a period or restructure the sentence
  - Never use the word "journey"
  - Climate content earns a quieter, more serious register than habit/mastery content
  - Destructive actions stay plain and direct — don't make dangerous buttons sound cute
  - No toxic positivity: "You showed up. That matters." not "You're doing great!"

  FORMATTING
  - Numerals in labels and chips: "3 left", "2 days"
  - Spell out in prose only when it reads unnaturally otherwise
  - Validation errors: "Required" not "This field is required"
  - Success toasts: state the fact, skip the celebration ("All assessments cleared.")

  SYSTEM CONCEPTS — use these terms consistently
  - "Freeze" / "Freezes": a token that protects a streak when a day is missed entirely
  - "Freeze count": how many freezes the user currently holds
  - "Streak debt": a negative freeze balance; occurs when tied habits are saved on credit
  - "Milestone": a 14-day interval of Yes logs that earns one freeze (14, 28, 42...)
  - "Tied habits": habits with equal streaks that missed on the same day; treated as a group
  - Do not invent new names for these concepts

  STREAK / FREEZE COPY SPECIFICALLY
  - Debt at -1: "Debt clears in N days"
  - Debt at -2: "Debt reduces in N days" (one freeze earned, not full clearance)
  - Frozen chip: "${n}-day streak, frozen" (comma, not em dash)
  - Paused toast: "[name] paused. Streak saved."
  - Resumed toast: "[name] is back. Streak restored."
  - Streak lost: acknowledge plainly, move on quickly — no dwelling, no sugarcoating
-->

<script setup lang="ts">
import { onMounted } from "vue";
import AppSnackbar from "./components/AppSnackbar.vue";
import { useMasteryStore } from "@/stores/mastery";
import { useThemeStore } from "@/stores/theme";

const masteryStore = useMasteryStore();
// Initialising here (not just in AppBarProfile) ensures the persisted theme
// is applied on every page load, not only when the Profile tab is visited.
useThemeStore();

// Reconcile streaks every time the app is opened.
// This catches missed days that occurred while the app was closed —
// persisted state has no mechanism to run logic between sessions.
onMounted(() => {
  masteryStore.reconcileStreaks();
});
</script>

<template>
  <v-app>
    <AppSnackbar />
    <RouterView />
  </v-app>
</template>
