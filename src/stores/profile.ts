import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabaseClient";
import { useSyncStore } from "@/stores/sync";
import type { ProfileRow, ProfileUpdate } from "@/types/database.types";
import type { PersistenceOptions } from "pinia-plugin-persistedstate";

export const useProfileStore = defineStore(
  "profile",
  () => {
    const profile = ref<ProfileRow | null>(null);
    const userEmail = ref<string | null>(null);
    const loading = ref(false);

    const isComplete = computed(() => {
      if (!profile.value) return false;
      const nameFilled = profile.value.name && profile.value.name.trim() !== "";
      const rollFilled = profile.value.roll_no && profile.value.roll_no.trim() !== "";
      return nameFilled && rollFilled;
    });

    async function fetchProfile(userId: string, email?: string, forceRefresh = false) {
      if (!forceRefresh && profile.value !== null && userEmail.value !== null) return;
      if (email) userEmail.value = email;

      loading.value = true;

      try {
        const profileRes = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle<ProfileRow>();

        if (profileRes.error) throw profileRes.error;
        if (profileRes.data) profile.value = profileRes.data;
      } finally {
        loading.value = false;
      }
    }

    async function updateProfile(updates: ProfileUpdate) {
      let userId = profile.value?.user_id;

      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No user authenticated");
        userId = user.id;
      }

      if (profile.value) {
        profile.value = { ...profile.value, ...updates };
      } else {
        profile.value = {
          user_id: userId,
          name: null,
          roll_no: null,
          gender: null,
          dob: null,
          theme: null,
          is_admin: false,
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      useSyncStore().enqueue({
        id: `profiles:${userId}`,
        table: "profiles",
        operation: "upsert",
        payload: { user_id: userId, ...updates },
        enqueuedAt: Date.now(),
      });
    }

    function reset() {
      profile.value = null;
      userEmail.value = null;
      loading.value = false;
    }

    return {
      profile,
      userEmail,
      isComplete,
      loading,
      fetchProfile,
      updateProfile,
      reset,
    };
  },
  {
    persist: {
      key: "profile-store",
      storage: localStorage,
      paths: ["profile", "userEmail"],
    } as PersistenceOptions,
  },
);
