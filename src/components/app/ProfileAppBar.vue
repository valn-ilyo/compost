<!-- Component -- app bar for the profile view with settings menu, theme controls, and account management -->
<script setup lang="ts">
import { ref } from 'vue'
import { useProfileStore } from '@/stores/profile.store'
import { useThemeStore } from '@/stores/theme.store'
import { useAssessmentStore } from '@/stores/assessment.store'
import { useNotifier } from '@/composables/useNotifier'
import { useLogout } from '@/composables/useLogout'
import { useSyncStore } from '@/stores/sync.store'
import { supabase } from '@/services/supabase.service'

const profileStore = useProfileStore()
const themeStore = useThemeStore()
const assessmentStore = useAssessmentStore()
const syncStore = useSyncStore()
const { notify } = useNotifier()
const { deleteAccount: deleteAccountAndLogout } = useLogout()

const showConfirmDialog = ref(false)
const showDeleteDialog = ref(false)
const isDeleting = ref(false)
const isResetting = ref(false)

async function clearAll() {
  const userId = profileStore.profile?.user_id
  if (!userId) return

  isResetting.value = true
  try {
    const { error } = await supabase.from('assessment_answers').delete().eq('user_id', userId)

    if (error) throw error

    assessmentStore.clearAll()
    notify({ message: 'All assessments cleared.', color: 'info' })
  } catch {
    notify({ message: 'Something went wrong. Please try again.', color: 'error' })
  } finally {
    isResetting.value = false
    showConfirmDialog.value = false
  }
}

async function deleteAccount() {
  isDeleting.value = true
  try {
    await deleteAccountAndLogout()
    // deleteAccountAndLogout() navigates to /auth on success.
    // It deliberately skips supabase.auth.signOut() - the user row no longer
    // exists in auth.users after delete_account() runs, so signOut returns
    // 403 user_not_found.
  } catch {
    isDeleting.value = false
    showDeleteDialog.value = false
    notify({
      message: 'Something went wrong. Please try again.',
      color: 'error',
    })
  }
}
</script>

<template>
  <VAppBar color="surface" flat>
    <VAppBarTitle>
      <span class="font-condensed">{{ profileStore.userEmail || 'Profile' }}</span>
    </VAppBarTitle>

    <template #append>
      <VMenu>
        <template #activator="{ props }">
          <VBtn v-bind="props" icon="mdi-cog-outline" />
        </template>
        <VList elevation="1" density="compact" rounded="lg" bg-color="surface-light">
          <VListItem
            :prepend-icon="
              themeStore.currentTheme === 'light'
                ? 'mdi-moon-waning-crescent'
                : 'mdi-white-balance-sunny'
            "
            :title="themeStore.currentTheme === 'light' ? 'Dark mode' : 'Light mode'"
            @click="themeStore.toggleTheme()"
          />
          <VListItem
            :prepend-icon="themeStore.contrastIcon"
            :title="themeStore.contrastLabel"
            @click="themeStore.cycleContrast()"
          />
          <VListItem
            prepend-icon="mdi-delete-sweep-outline"
            :title="
              syncStore.status !== 'offline' ? 'Reset assessments' : 'Reset requires connection'
            "
            :base-color="syncStore.status !== 'offline' ? 'error' : undefined"
            :disabled="syncStore.status === 'offline'"
            @click="showConfirmDialog = true"
          />
          <VDivider class="my-1" />
          <VListItem
            prepend-icon="mdi-account-remove-outline"
            title="Delete account"
            base-color="error"
            @click="showDeleteDialog = true"
          />
        </VList>
      </VMenu>

      <VBtn icon="mdi-information-variant" to="/docs" />
    </template>
  </VAppBar>

  <VDialog v-model="showConfirmDialog" width="auto" :persistent="isResetting">
    <VCard rounded="lg">
      <VCardTitle class="pt-6 px-6">Clear all assessments?</VCardTitle>
      <VCardText class="px-6 text-medium-emphasis">
        All your answers will be deleted. This can't be undone.
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="error" variant="text" :loading="isResetting" @click="clearAll"> Reset </VBtn>
        <VBtn
          color="primary"
          variant="flat"
          rounded="lg"
          :disabled="isResetting"
          @click="showConfirmDialog = false"
        >
          Keep it
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VDialog v-model="showDeleteDialog" width="auto" :persistent="isDeleting">
    <VCard rounded="lg">
      <VCardTitle class="pt-6 px-6">Delete your account?</VCardTitle>
      <VCardText class="px-6 text-medium-emphasis">
        This deletes your profile, answers, and habit data for good. It can't be undone.
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="error" variant="text" :loading="isDeleting" @click="deleteAccount">
          Delete
        </VBtn>
        <VBtn
          color="primary"
          variant="flat"
          rounded="lg"
          :disabled="isDeleting"
          @click="showDeleteDialog = false"
        >
          Keep it
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
