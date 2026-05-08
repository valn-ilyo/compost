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
  - "Milestone": a 22-day interval of Yes logs that earns one freeze (22, 44, 66...)
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
import { useMasteryRecommendations } from "@/composables/useMasteryRecommendations";
import { useSyncStore } from "@/stores/sync";
import { useAssessmentStore } from "@/stores/assessment";
import { useProfileStore } from "@/stores/profile";
import { supabase } from "@/lib/supabaseClient";

const masteryStore = useMasteryStore();
const assessmentStore = useAssessmentStore();
const profileStore = useProfileStore();
const syncStore = useSyncStore();
// Initialising here (not just in AppBarProfile) ensures the persisted theme
// is applied on every page load, not only when the Profile tab is visited.
useThemeStore();
// Initialise here so recommendedHabitIds is populated regardless of which
// view the user lands on first — not just when MasteryView mounts.
useMasteryRecommendations();

// Reconcile streaks on every app open — but only after hydration is complete
// so that sync.enqueue() is live and reconcile mutations reach Supabase.
// The actual reconcileStreaks() call lives in AuthView.runHydration() right
// after syncStore.setHydrated(). Calling it here (before hydration) would
// cause reconcile to mutate local state while enqueue() is still a no-op,
// so the streak resets would never be pushed to Supabase.
onMounted(() => {
  // Register the reconnect callback before init() attaches the online listener.
  // When the device comes back online, we re-pull from Supabase first so the
  // local stores reflect what other devices wrote while offline, then drain
  // the queue so local changes are pushed on top of that truth.
  syncStore.onReconnect(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;
    const email = session.user.email ?? undefined;

    syncStore.beginHydrating();
    try {
      await Promise.all([
        profileStore.fetchProfile(userId, email),
        assessmentStore.hydrateFromSupabase(userId),
        masteryStore.hydrateFromSupabase(userId),
      ]);
    } finally {
      syncStore.endHydrating();
    }
  });

  syncStore.init();
});
</script>

<template>
  <v-app>
    <AppSnackbar />
    <RouterView />
  </v-app>
</template>
