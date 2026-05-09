import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/lib/supabaseClient";
import { useProfileStore } from "@/stores/profile";
import { useAssessmentStore } from "@/stores/assessment";
import { useMasteryStore } from "@/stores/mastery";
import { useSyncStore } from "@/stores/sync";

/**
 * Wipes all persisted store state.
 * Called on logout AND at the start of every login hydration to prevent
 * a previous user's localStorage data from bleeding into a new session.
 *
 * Belt-and-suspenders approach: $patch resets in-memory state immediately,
 * and the explicit localStorage.removeItem() wipes the persisted snapshot so
 * a crash-interrupted session leaves no residue for the next user on this device.
 * isHydrated is reset so runHydration() never silently no-ops on same-tab re-login.
 */
export function resetAllStores() {
  const syncStore = useSyncStore();
  syncStore.clearQueue();
  syncStore.isHydrated = false;

  useProfileStore().reset();
  useAssessmentStore().clearAll();
  useMasteryStore().$patch({
    slots: [],
    freezeCount: 0,
    masteredArchive: [],
    lastReconcileEvents: [],
  });

  // Explicitly remove persisted snapshots from localStorage so stale data
  // cannot survive a crash or force-close between sessions.
  localStorage.removeItem("mastery");
  localStorage.removeItem("assessment");
  localStorage.removeItem("profile-store");
  localStorage.removeItem("sync-store");
}

export function useLogout() {
  const router = useRouter();
  const loggingOut = ref(false);

  const logout = async (redirectTo: string = "/auth") => {
    loggingOut.value = true;
    try {
      await supabase.auth.signOut();
    } finally {
      // Always reset stores — even if signOut fails, local state must be cleared
      // so subsequent Supabase writes don't silently 401 with stale credentials.
      resetAllStores();
    }
    await router.push(redirectTo);
    loggingOut.value = false;
  };

  return { logout, loggingOut };
}
