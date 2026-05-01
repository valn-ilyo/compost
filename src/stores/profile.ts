import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { Profile } from '@/types/database.types'
import type { PersistenceOptions } from 'pinia-plugin-persistedstate'

export const useProfileStore = defineStore(
  'profile',
  () => {
    // 1. Database Table Data
    const profile = ref<Profile | null>(null)

    // 2. Auth System Data (Separate to keep types clean)
    const userEmail = ref<string | null>(null)

    const loading = ref(false)

    const isComplete = computed(() => {
      if (!profile.value) return false
      const nameFilled = profile.value.name && profile.value.name.trim() !== ''
      const rollFilled = profile.value.roll_no && profile.value.roll_no.trim() !== ''
      return nameFilled && rollFilled
    })

    async function fetchProfile(userId: string) {
      // If we already have both, don't fetch again
      if (profile.value !== null && userEmail.value !== null) return

      loading.value = true

      try {
        // Fetch Auth User and Profile Table in parallel for better performance
        const [authRes, profileRes] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle<Profile>()
        ])

        // Set Email from Auth (Lives in supabase.auth.users)
        if (authRes.data.user) {
          userEmail.value = authRes.data.user.email ?? null
        }

        // Set Profile Data (Lives in public.profiles)
        if (profileRes.data) {
          profile.value = profileRes.data
        }

        if (profileRes.error) {
          console.error('Failed to fetch profile:', profileRes.error)
        }
      } catch (error) {
        console.error('Unexpected error fetching profile details:', error)
      } finally {
        loading.value = false
      }
    }

    async function updateProfile(updates: {
      name: string
      roll_no: string
      gender?: string
      dob?: string
    }) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user authenticated')

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Update local cache for the profile table data
      if (profile.value) {
        profile.value = { ...profile.value, ...updates }
      } else {
        profile.value = {
          id: user.id,
          ...updates,
          gender: updates.gender ?? null,
          dob: updates.dob ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
    }

    function reset() {
      profile.value = null
      userEmail.value = null
      loading.value = false
    }

    return {
      profile,
      userEmail, // Exposed for the "Not you?" button
      isComplete,
      loading,
      fetchProfile,
      updateProfile,
      reset
    }
  },
  {
    persist: {
      key: 'profile-store',
      storage: localStorage,
      // Persist both the profile data and the email
      paths: ['profile', 'userEmail'],
    } as PersistenceOptions,
  }
)
