import { useRouter } from "vue-router";
import { supabase } from "@/lib/supabaseClient";
import { useProfileStore } from "@/stores/profile";
import { useAssessmentStore } from "@/stores/assessment";
import { useMasteryStore } from "@/stores/mastery";

export function useLogout() {
  const router = useRouter();

  const logout = async (redirectTo: string = "/auth") => {
    await supabase.auth.signOut();
    useProfileStore().reset();
    useAssessmentStore().clearAll();
    useMasteryStore().$reset();
    await router.push(redirectTo);
  };

  return { logout };
}
