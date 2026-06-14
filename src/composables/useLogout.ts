// Composable -- logout flow, account deletion, push unsubscribe, and full store reset
//
// resetAllStores is called at the start of every hydration cycle (to clear
// stale state before pulling fresh data) and on explicit logout.
//
// It clears in-memory state and the localStorage cache. The sync queue is also
// cleared; any pending writes are abandoned on logout. On hydration, the queue
// is drained first before resetAllStores is called, so in-flight writes are
// committed before the state wipe.

import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/services/supabase.service";
import { useMasteryStore } from "@/stores/mastery.store";
import { useAssessmentStore } from "@/stores/assessment.store";
import { useProfileStore } from "@/stores/profile.store";
import { useSyncStore } from "@/stores/sync.store";

export function resetAllStores() {
  const masteryStore = useMasteryStore();
  const assessmentStore = useAssessmentStore();
  const profileStore = useProfileStore();
  const syncStore = useSyncStore();

  // Sync store first; mark as not hydrated so no writes go to Supabase
  // during the wipe, and clear any pending queue items.
  syncStore.clearQueue();
  syncStore.isHydrated = false;

  profileStore.reset();
  assessmentStore.clearAll();

  masteryStore.habitLogs = [];
  masteryStore.freezeLedger = [];
  masteryStore.habitSlots = [];
  masteryStore.pauseEvents = [];
  masteryStore.masteredArchive = [];
  masteryStore.lastReconcileEvents = [];

  localStorage.removeItem("mastery");
  localStorage.removeItem("assessment");
  localStorage.removeItem("profile-store");
  localStorage.removeItem("sync-store");
}

// Best-effort; failures AND hangs are swallowed so they never block logout.
// Races against a 3-second timeout because navigator.serviceWorker.ready can
// stall indefinitely when the SW is in a broken or installing state.
// Must be called before supabase.auth.signOut() while the session is still
// valid (the DELETE is subject to RLS: users manage own rows).
async function unsubscribePush(): Promise<void> {
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, 3000));
  const work = async (): Promise<void> => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;

      // Delete the DB row first (session still valid here).
      await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);

      // Then unsubscribe the browser so the endpoint is truly gone.
      await subscription.unsubscribe();
    } catch (e) {
      if (import.meta.env.DEV) console.warn("[push] unsubscribePush failed", e);
    }
  };
  // Race: if push cleanup takes longer than 3 s, give up and proceed with logout.
  await Promise.race([work(), timeout]);
}

export function useLogout() {
  const router = useRouter();
  const loggingOut = ref(false);

  // signOut is best-effort; even if it fails (e.g. offline), local state is
  // cleared so the user reaches the auth screen.
  const logout = async (redirectTo = "/auth") => {
    loggingOut.value = true;
    try {
      await unsubscribePush(); // remove this device's subscription before session ends
      await supabase.auth.signOut();
    } finally {
      resetAllStores();
    }
    await router.push(redirectTo);
    loggingOut.value = false;
  };

  // Order matters:
  //   1. unsubscribePush() -- while the session is still valid, remove this
  //      device's push subscription (RLS-protected DB DELETE + browser
  //      subscription.unsubscribe()). The DB row will also be CASCADE-deleted
  //      by the RPC below, but the browser unsubscribe must happen here, before
  //      the session is gone.
  //   2. Call delete_account() RPC -- removes the row from auth.users (CASCADE
  //      wipes all user data across every table).
  //   3. resetAllStores() -- wipe in-memory and localStorage state.
  //   4. supabase.auth.signOut() -- the server returns 403 user_not_found (the
  //      user no longer exists in auth.users), but the Supabase JS v2 client
  //      clears its local session and fires SIGNED_OUT regardless. Skipping
  //      this call leaves the stale JWT in the client's session storage; on the
  //      next hydration cycle the router sees a "live" session, finds no profile
  //      row, and triggers an onboarding upsert that fails with 23503 (FK
  //      violation -- user_id no longer exists in auth.users).
  //   5. Navigate to /auth.
  //
  // Throws on RPC failure so the caller can show an error and leave the user
  // logged in (their account is still intact).
  const deleteAccount = async () => {
    loggingOut.value = true;
    try {
      await unsubscribePush(); // remove push subscription while session is valid
      const { error } = await supabase.rpc("delete_account");
      if (error) throw error;
      resetAllStores();
      await supabase.auth.signOut();
      await router.push("/auth");
    } finally {
      loggingOut.value = false;
    }
  };

  return { logout, loggingOut, deleteAccount };
}
