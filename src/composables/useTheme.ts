// Composable -- theme toggle and contrast cycle with sync queue enqueue
import { useThemeStore } from '@/stores/theme.store'
import { useSyncStore } from '@/stores/sync.store'
import { useProfileStore } from '@/stores/profile.store'

/**
 * Coordinates theme changes across the theme store and sync queue without
 * either store knowing about the other.
 *
 * Replaces direct themeStore calls in SettingsView.
 */
export function useTheme() {
  const themeStore = useThemeStore()
  const syncStore = useSyncStore()
  const profileStore = useProfileStore()

  function _enqueueThemeSync() {
    const userId = profileStore.profile?.user_id
    if (!userId) return

    syncStore.enqueue({
      id: `profiles:${userId}`,
      table: 'profiles',
      operation: 'upsert',
      payload: { user_id: userId, theme: themeStore.currentTheme },
      enqueuedAt: Date.now(),
    })
  }

  function toggleTheme() {
    themeStore.toggleTheme()
    _enqueueThemeSync()
  }

  function cycleContrast() {
    themeStore.cycleContrast()
    _enqueueThemeSync()
  }

  return { toggleTheme, cycleContrast }
}
