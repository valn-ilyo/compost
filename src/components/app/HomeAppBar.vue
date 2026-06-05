<!-- Component -- app bar for the home view with sync status indicator and climate clock toggle -->
<script setup lang="ts">
import { computed } from 'vue'
import { useClockVisibleStore } from '@/stores/clock-visible.store'
import { useSyncStore } from '@/stores/sync.store'

const clockVisibleStore = useClockVisibleStore()
const syncStore = useSyncStore()

const cloudIcon = computed(() => {
  if (syncStore.status === 'hydrating') return 'mdi-cloud-arrow-down-outline'
  if (syncStore.status === 'synced') return 'mdi-cloud-check-outline'
  if (syncStore.status === 'syncing') return 'mdi-cloud-sync-outline'
  return 'mdi-cloud-off-outline'
})

const cloudColor = computed(() => {
  if (syncStore.status === 'hydrating') return 'info'
  if (syncStore.status === 'syncing') return 'info'
  if (syncStore.status === 'offline') return 'error'
  return undefined
})

const cloudTooltip = computed(() => {
  if (syncStore.status === 'hydrating') {
    return syncStore.queue.length > 0
      ? 'Restoring your data. Changes will sync after.'
      : 'Restoring your data.'
  }
  if (syncStore.status === 'synced') return 'Data synced.'
  if (syncStore.status === 'syncing') return 'Syncing data.'
  return "You're offline. Data syncs when you reconnect."
})
</script>

<template>
  <VAppBar color="surface" flat>
    <template #prepend>
      <VAppBarNavIcon :ripple="false" style="cursor: default; pointer-events: none">
        <VIcon icon="custom:sac" size="48" />
      </VAppBarNavIcon>
    </template>

    <VAppBarTitle>Compost</VAppBarTitle>

    <template #append>
      <VTooltip :text="cloudTooltip" location="bottom">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            :icon="cloudIcon"
            :color="cloudColor"
            :class="{
              'icon-flashing': syncStore.status === 'syncing' || syncStore.status === 'hydrating',
            }"
            :ripple="false"
            style="cursor: default"
          />
        </template>
      </VTooltip>

      <VBtn
        :icon="
          clockVisibleStore.clockVisible ? 'mdi-clock-minus-outline' : 'mdi-clock-plus-outline'
        "
        @click="clockVisibleStore.toggleClock()"
      />
    </template>
  </VAppBar>
</template>

<style scoped>
.icon-flashing {
  animation: flash 1s ease-in-out infinite;
}

@keyframes flash {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
