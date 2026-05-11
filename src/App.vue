<script setup lang="ts">
import { onMounted } from "vue";
import AppSnackbar from "./components/app/AppSnackbar.vue";
import { useMasteryStore } from "@/stores/mastery";
import { useThemeStore } from "@/stores/theme";
import { useMasteryRecommendations } from "@/composables/useMasteryRecommendations";
import { useSyncStore } from "@/stores/sync";
import { useAssessmentStore } from "@/stores/assessment";
import { useProfileStore } from "@/stores/profile";
import { supabase } from "@/services/supabase";

// NEW: import the midnight hook from clock.ts.
// OLD: this import did not exist — nothing in App.vue referenced clock.ts.
// clock.ts now exports onMidnight() which fires callbacks inside
// scheduleMidnightRefresh()'s setTimeout, after clock.now is reassigned.
import { onMidnight } from "@/utils/clock";

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
        profileStore.fetchProfile(userId, email, true),
        assessmentStore.hydrateFromSupabase(userId),
        masteryStore.hydrateFromSupabase(userId),
      ]);
    } finally {
      syncStore.endHydrating();
    }

    // Reconcile after endHydrating() so enqueue() is live.
    masteryStore.reconcileStreaks();
  });

  syncStore.init();

  // NEW: register midnight reconcile for users who leave the app open overnight.
  //
  // OLD: nothing ran at midnight for open sessions. scheduleMidnightRefresh()
  // in clock.ts only reassigned clock.now — it had no mechanism to call
  // reconcileStreaks(). The result: a user with the app open at midnight would
  // see the date tick over (computed values updated) but streaks were never
  // reconciled until the next app open or reconnect.
  //
  // NEW: clock.ts now exports onMidnight(cb) which pushes cb into
  // midnightCallbacks[]. scheduleMidnightRefresh() iterates that array after
  // reassigning clock.now — see the for..of loop at the bottom of clock.ts.
  //
  // Guard: only run when hydration is complete so enqueue() is live and
  // streak mutations actually reach Supabase. Matches the same guard used
  // in the onReconnect callback above and in sync.ts's watch(isOnline).
  onMidnight(() => {
    if (syncStore.isHydrated) masteryStore.reconcileStreaks();
  });
});
</script>

<template>
  <v-app>
    <AppSnackbar />
    <RouterView />
  </v-app>
</template>
