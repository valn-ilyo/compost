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
import type {
  HabitLog,
  FreezeLedgerRow,
  HabitSlot,
  HabitPauseEvent,
  MasteredEntry,
} from "@/types/app";
import { onMidnight } from "@/utils/clock";

const masteryStore = useMasteryStore();
const assessmentStore = useAssessmentStore();
const profileStore = useProfileStore();
const syncStore = useSyncStore();

useThemeStore();
useMasteryRecommendations();

onMounted(() => {
  // ── Cap rejection callback ─────────────────────────────────────────────────
  //
  // Registered before init() so it is in place the moment drain() might
  // encounter a slot_cap_exceeded error. When drain() discards an RPC item
  // due to a cap mismatch, it calls this function which:
  //   1. Full-replaces habit_slots and habit_pause_events from the server.
  //   2. Reconciles streaks against the corrected slot state.
  //
  // App.vue is the correct wiring point — sync.ts cannot import mastery.ts
  // (circular dependency: mastery.ts already imports sync.ts).

  syncStore.setCapRejectionCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    await masteryStore.hydrateFromSupabase(session.user.id, true);
    masteryStore.reconcile();
  });

  // ── Reconnect callback ─────────────────────────────────────────────────────
  //
  // Fires after drain() in the reconnect sequence. Re-hydrates all stores
  // from Supabase (forceRemote=true) so the local state reflects what other
  // devices wrote while offline.

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

    masteryStore.reconcile();
  });

  syncStore.init();

  // ── Realtime ───────────────────────────────────────────────────────────────
  //
  // Start once hydration completes; stop on logout (isHydrated → false).
  //
  // Handler inventory:
  //   habit_logs, freeze_ledger, mastered_archive — INSERT only (append-only)
  //   habit_slots         — INSERT + UPDATE + DELETE (mutable state)
  //   habit_pause_events  — INSERT + UPDATE (windows open and close)
  //
  // eventType is forwarded from sync.ts so the mastery merge handlers can
  // apply the correct operation without inspecting row fields.

  watch(
    () => syncStore.isHydrated,
    (hydrated) => {
      if (hydrated) {
        syncStore.startRealtime({
          onHabitLog: (row) => masteryStore.mergeHabitLog(row as unknown as HabitLog),

          onFreezeRow: (row) =>
            masteryStore.mergeFreezeLedgerRow(row as unknown as FreezeLedgerRow),

          onHabitSlot: (row, eventType) =>
            masteryStore.mergeHabitSlot(row as unknown as HabitSlot, eventType),

          onPauseEvent: (row, eventType) =>
            masteryStore.mergePauseEvent(row as unknown as HabitPauseEvent, eventType),

          onMasteredEntry: (row) =>
            masteryStore.mergeMasteredArchiveRow(row as unknown as MasteredEntry),
        });
      } else {
        syncStore.stopRealtime();
      }
    },
  );

  // ── Midnight reconcile ─────────────────────────────────────────────────────
  //
  // For users who leave the app open overnight. Guard: only run when hydrated
  // so enqueue() is live and streak mutations reach Supabase.

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
