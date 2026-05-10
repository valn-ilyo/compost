import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/services/supabase";
import { useProfileStore } from "@/stores/profile";
import { useAssessmentStore } from "@/stores/assessment";
import { useMasteryStore } from "@/stores/mastery";
import { useSyncStore } from "@/stores/sync";

/** Wipes all persisted store state. Called on logout and at the start of every hydration. */
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
      // Always reset stores — even if signOut fails.
            resetAllStores();
    }
    await router.push(redirectTo);
    loggingOut.value = false;
  };

  return { logout, loggingOut };
}
