<script setup lang="ts">
import { onMounted, watch } from "vue";
import AppSnackbar from "./components/app/AppSnackbar.vue";
import { useMasteryStore } from "@/stores/mastery";
import { useThemeStore } from "@/stores/theme";
import { useMasteryRecommendations } from "@/composables/useMasteryRecommendations";
import { useSyncStore } from "@/stores/sync";
import { useAssessmentStore } from "@/stores/assessment";
import { useProfileStore } from "@/stores/profile";
import { supabase } from "@/services/supabase";
import type { HabitLog, FreezeLedgerRow, SlotEvent, MasteredEntry } from "@/types/app";

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
// The actual reconcile() call lives in AuthView.runHydration() right
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
        assessmentStore.hydrateFromSupabase(userId, true),
        masteryStore.hydrateFromSupabase(userId, true),
      ]);
    } finally {
      syncStore.endHydrating();
    }

    // Reconcile after endHydrating() so enqueue() is live.
    masteryStore.reconcile();
  });

  syncStore.init();

  // Phase 5: start Realtime once hydration completes, stop on logout.
  //
  // Watching isHydrated is the correct trigger because:
  //   - It becomes true at the end of AuthView.runHydration(), after all stores
  //     are populated and enqueue() is live.
  //   - It becomes false on logout (resetAllStores() sets isHydrated = false),
  //     so channels are torn down automatically when the session ends.
  //
  // App.vue is the correct orchestration point — it's the only file that imports
  // both syncStore and masteryStore, which avoids a circular dependency
  // (mastery.ts already imports sync.ts).
  watch(
    () => syncStore.isHydrated,
    (hydrated) => {
      if (hydrated) {
        syncStore.startRealtime({
          onHabitLog:      (row) => masteryStore.mergeHabitLog(row as HabitLog),
          onFreezeRow:     (row) => masteryStore.mergeFreezeLedgerRow(row as FreezeLedgerRow),
          onSlotEvent:     (row) => masteryStore.mergeSlotEvent(row as SlotEvent),
          onMasteredEntry: (row) => masteryStore.mergeMasteredArchiveRow(row as MasteredEntry),
        });
      } else {
        syncStore.stopRealtime();
      }
    },
  );

  // NEW: register midnight reconcile for users who leave the app open overnight.
  //
  // OLD: nothing ran at midnight for open sessions. scheduleMidnightRefresh()
  // in clock.ts only reassigned clock.now — it had no mechanism to call
  // reconcile(). The result: a user with the app open at midnight would
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
    if (syncStore.isHydrated) masteryStore.reconcile();
  });
});
</script>

<template>
  <v-app>
    <AppSnackbar />
    <RouterView />
  </v-app>
</template>
