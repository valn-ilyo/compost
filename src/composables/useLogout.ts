import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useProfileStore } from '@/stores/profile'

export function useLogout() {
  const router = useRouter()

  const logout = async (redirectTo: string = '/auth') => {
    await supabase.auth.signOut()
    const profileStore = useProfileStore()
    profileStore.reset()
    await router.push(redirectTo)
  }

  return { logout }
}
