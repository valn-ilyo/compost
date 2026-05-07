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
 */
export function resetAllStores() {
  useSyncStore().clearQueue();
  useProfileStore().reset();
  useAssessmentStore().clearAll();
  useMasteryStore().$patch({
    slots: [],
    freezeCount: 0,
    masteredArchive: [],
    lastReconcileEvents: [],
  });
}

export function useLogout() {
  const router = useRouter();
  const loggingOut = ref(false);

  const logout = async (redirectTo: string = "/auth") => {
    loggingOut.value = true;
    await supabase.auth.signOut();
    resetAllStores();
    await router.push(redirectTo);
    loggingOut.value = false;
  };

  return { logout, loggingOut };
}
