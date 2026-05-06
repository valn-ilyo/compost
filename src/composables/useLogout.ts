import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/lib/supabaseClient";
import { useProfileStore } from "@/stores/profile";
import { useAssessmentStore } from "@/stores/assessment";
import { useMasteryStore } from "@/stores/mastery";
import { useSyncStore } from "@/stores/sync";

export function useLogout() {
  const router = useRouter();
  const loggingOut = ref(false);

  const logout = async (redirectTo: string = "/auth") => {
    loggingOut.value = true;
    await supabase.auth.signOut();
    useSyncStore().clearQueue();
    useProfileStore().reset();
    useAssessmentStore().clearAll();
    useMasteryStore().$patch({
      slots: [],
      freezeCount: 0,
      masteredArchive: [],
      lastReconcileEvents: [],
    });
    await router.push(redirectTo);
    loggingOut.value = false;
  };

  return { logout, loggingOut };
}
