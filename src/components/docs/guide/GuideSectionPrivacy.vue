<script setup lang="ts">
// No data derivation. Static prose.
</script>

<template>
  <section id="privacy">
    <div class="text-overline text-medium-emphasis px-1 mb-1">Privacy</div>
    <v-card flat rounded="xl" class="mb-8">
      <v-card-text class="pb-1">
        <p class="text-body-2 mb-4">
          The app stores the minimum data needed to function. Nothing is sold or shared with third
          parties.
        </p>
      </v-card-text>

      <v-divider />

      <v-list-item prepend-icon="mdi-database-outline" title="What's stored" class="pt-2" />
      <v-card-text class="pt-1 pb-3">
        <p class="text-body-2 mb-2">
          Your account is identified by your Google account ID and email address. The app stores
          your assessment answers, habit slots, mastery state, and display name if you set one.
        </p>
        <p class="text-body-2">
          A local copy of all data is kept in your browser's storage so the app works offline.
        </p>
      </v-card-text>

      <v-divider />

      <v-list-item prepend-icon="mdi-server-outline" title="Where it goes" class="pt-2" />
      <v-card-text class="pt-1 pb-3">
        <p class="text-body-2">
          Data is stored in a Supabase database. Authentication is handled by Supabase Auth via
          Google OAuth. Your assessment data is only accessible to your own account.
        </p>
      </v-card-text>

      <v-divider />

      <v-list-item prepend-icon="mdi-delete-outline" title="Deleting your data" class="pt-2" />
      <v-card-text class="pt-1 pb-4">
        <p class="text-body-2">
          You can reset your assessment answers from the Assessment tab. Deleting your account
          removes all stored data permanently.
          <!-- TODO: before handover, replace the line below with the actual contact name,
               email address, or link to the feedback form. -->
          Contact the project maintainer to request full account deletion.
        </p>
      </v-card-text>
    </v-card>
  </section>
</template>
