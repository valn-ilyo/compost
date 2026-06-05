<!-- Component -- guide sync section, cloud icon state explanations -->
<template>
  <section id="sync-and-offline">
    <div class="text-overline text-medium-emphasis px-1 mb-1">Sync and offline</div>
    <VCard flat rounded="xl" class="mb-8">
      <VCardText class="pb-1">
        <p class="text-body-2 mb-4">
          The app works fully offline. Any changes you make without a connection are queued locally
          and synced to the server when you reconnect. Nothing is lost.
        </p>
      </VCardText>

      <VDivider />

      <VListItem prepend-icon="mdi-cloud-check-outline" title="Data synced." class="pt-2" />
      <VCardText class="pt-1 pb-3">
        <p class="text-body-2">Everything is up to date.</p>
      </VCardText>

      <VDivider />

      <VListItem prepend-icon="mdi-cloud-sync-outline" title="Syncing data." class="pt-2" />
      <VCardText class="pt-1 pb-3">
        <p class="text-body-2">Queued changes are being written to the server now.</p>
      </VCardText>

      <VDivider />

      <VListItem
        prepend-icon="mdi-cloud-arrow-down-outline"
        title="Restoring your data."
        class="pt-2"
      />
      <VCardText class="pt-1 pb-3">
        <p class="text-body-2 mb-2">
          The app is loading your data from the server. If you made changes while offline, those
          will sync after the restore completes.
        </p>
        <p class="text-body-2">
          If offline changes are waiting, the tooltip extends to
          <em>Restoring your data. Changes will sync after.</em>
        </p>
      </VCardText>

      <VDivider />

      <VListItem prepend-icon="mdi-cloud-off-outline" title="You're offline." class="pt-2" />
      <VCardText class="pt-1 pb-4">
        <p class="text-body-2">
          No connection detected. The app continues to work. Changes queue up and sync automatically
          when you're back online.
        </p>
      </VCardText>
    </VCard>
  </section>
</template>
