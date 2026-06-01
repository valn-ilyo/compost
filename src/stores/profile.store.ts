// Pinia store -- user profile row with optimistic updates, hydration, and onboarding gate
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { ProfileRow, ProfileUpdate } from "@/types/database.types";
import type { PersistenceOptions } from "pinia-plugin-persistedstate";
import { supabase } from "@/services/supabase.service";
import { useSyncStore } from "@/stores/sync.store";

export const useProfileStore = defineStore(
  "profile",
  () => {
    const profile = ref<ProfileRow | null>(null);
    const userEmail = ref<string | null>(null);
    const loading = ref(false);

    // Populated during fetchProfile(). Carried on every enqueued row.
    const userId = ref<string>("");

    // Controls whether the router redirects to the onboarding flow.
    const isComplete = computed(() => {
      if (!profile.value) return false;
      const nameFilled = profile.value.name?.trim() !== "";
      const rollFilled = profile.value.roll_no?.trim() !== "";
      return nameFilled && rollFilled;
    });

    // fetchProfile is a direct Supabase call (not queued) because it is a
    // prerequisite for hydration -- the router needs isComplete before it can
    // decide whether to redirect to onboarding.
    //
    // If no row exists yet (PGRST116), hydration completes with profile=null so
    // the router can redirect to onboarding where the user creates their profile.
    // Profile rows are typically created by a Supabase trigger on auth.users insert.
    //
    // Merge rule:
    //   forceRemote = true (reconnect): server wins -- overwrite local profile.
    //   forceRemote = false (cold start): local wins if a profile is already cached.
    //     This prevents a round-trip from discarding profile edits made offline.
    async function fetchProfile(newUserId: string, email?: string, forceRemote = false) {
      userId.value = newUserId;
      if (email) userEmail.value = email;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", newUserId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No profile row yet -- leave profile null, router handles onboarding redirect.
          return;
        }
        throw error;
      }

      if (forceRemote || !profile.value) {
        profile.value = data as ProfileRow;
      }
    }

    // Optimistically apply updates to the local profile ref, then enqueue a upsert.
    // Shallow merge: incoming fields win, others preserved.
    // Idempotency key: user_id -- dedup in drain merges payload fields.
    async function updateProfile(updates: ProfileUpdate) {
      // Always apply optimistically, even on first save when profile.value is
      // null (the trigger created the DB row but fetchProfile hasn't run yet).
      // Without this, isComplete stays false and the router guard immediately
      // re-intercepts the navigation back to onboarding after the user submits.
      profile.value = {
        ...(profile.value ??
          ({
            user_id: userId.value,
            is_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            name: null,
            roll_no: null,
            gender: null,
            dob: null,
            theme: null,
          } satisfies ProfileRow)),
        ...updates,
      };

      useSyncStore().enqueue({
        id: `profiles:${userId.value}`,
        table: "profiles",
        operation: "upsert",
        payload: { user_id: userId.value, ...updates },
        enqueuedAt: Date.now(),
      });
    }

    // Called by resetAllStores() on logout and hydration start.
    function reset() {
      profile.value = null;
      userEmail.value = null;
      userId.value = "";
      loading.value = false;
    }

    return { profile, userEmail, userId, isComplete, loading, fetchProfile, updateProfile, reset };
  },
  {
    persist: {
      key: "profile-store",
      storage: localStorage,
      pick: ["profile", "userEmail"],
    } as PersistenceOptions,
  },
);
