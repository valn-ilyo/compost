// ─── useLogout / resetAllStores ───────────────────────────────────────────────
// resetAllStores is called at the start of every hydration cycle (to clear
// stale state before pulling fresh data) and on explicit logout.
//
// It clears in-memory state and the localStorage cache. The sync queue is also
// cleared — any pending writes are abandoned on logout. On hydration, the queue
// is drained first before resetAllStores is called, so in-flight writes are
// committed before the state wipe.
// ─────────────────────────────────────────────────────────────────────────────

import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/services/supabase";
import { useMasteryStore } from "@/stores/mastery";
import { useAssessmentStore } from "@/stores/assessment";
import { useProfileStore } from "@/stores/profile";
import { useSyncStore } from "@/stores/sync";

export function resetAllStores() {
  const masteryStore = useMasteryStore();
  const assessmentStore = useAssessmentStore();
  const profileStore = useProfileStore();
  const syncStore = useSyncStore();

  // Sync store first — mark as not hydrated so no writes go to Supabase
  // during the wipe, and clear any pending queue items.
  syncStore.clearQueue();
  syncStore.isHydrated = false;

  // Clear profile and assessment (mutable stores — full reset).
  profileStore.reset();
  assessmentStore.clearAll();

  // Clear all mastery ledger arrays and session-scoped reconcile events.
  masteryStore.habitLogs = [];
  masteryStore.freezeLedger = [];
  masteryStore.habitSlots = [];
  masteryStore.pauseEvents = [];
  masteryStore.masteredArchive = [];
  masteryStore.lastReconcileEvents = [];

  // Remove persisted localStorage cache so the next session starts clean.
  localStorage.removeItem("mastery");
  localStorage.removeItem("assessment");
  localStorage.removeItem("profile-store");
  localStorage.removeItem("sync-store");
}

export function useLogout() {
  const router = useRouter();
  const loggingOut = ref(false);

  /**
   * Sign out and wipe all local state.
   * signOut is best-effort — even if it fails (e.g. offline), local state is
   * cleared so the user reaches the auth screen.
   */
  const logout = async (redirectTo = "/auth") => {
    loggingOut.value = true;
    try {
      await supabase.auth.signOut();
    } finally {
      resetAllStores();
    }
    await router.push(redirectTo);
    loggingOut.value = false;
  };

  /**
   * Delete account then clear local state.
   *
   * Order matters:
   *   1. Call delete_account() RPC — removes the row from auth.users (CASCADE
   *      wipes all user data across every table).
   *   2. resetAllStores() — wipe in-memory and localStorage state.
   *   3. Navigate to /auth — skip supabase.auth.signOut() entirely. The user
   *      no longer exists in auth.users, so signOut returns 403 user_not_found.
   *      The session JWT is already invalid; no server-side invalidation needed.
   *
   * Throws on RPC failure so the caller can show an error and leave the user
   * logged in (their account is still intact).
   */
  const deleteAccount = async () => {
    loggingOut.value = true;
    try {
      const { error } = await supabase.rpc("delete_account");
      if (error) throw error;
      resetAllStores();
      await router.push("/auth");
    } finally {
      loggingOut.value = false;
    }
  };

  return { logout, loggingOut, deleteAccount };
}
