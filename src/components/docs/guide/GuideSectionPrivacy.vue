<!-- Component -- guide privacy section, data storage and deletion policy -->
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

      <v-list-item prepend-icon="mdi-chart-arc" title="Anonymous analytics" class="pt-2" />
      <v-card-text class="pt-1 pb-3">
        <p class="text-body-2">
          Administrators use aggregated, anonymised data to understand how the programme is being
          used and where it can be improved. This includes figures such as habit adoption counts and
          assessment score distributions. No information that could identify you personally is
          included.
        </p>
      </v-card-text>

      <v-divider />

      <v-list-item prepend-icon="mdi-delete-outline" title="Deleting your data" class="pt-2" />
      <v-card-text class="pt-1 pb-4">
        <p class="text-body-2 mb-2">
          Two self-service options are available from the
          <v-icon size="14" class="mb-1">mdi-cog-outline</v-icon> menu on the Profile screen.
        </p>
        <p class="text-body-2 mb-2">
          <strong>Reset assessments</strong> clears all your section answers and scores. Your habit
          slots and profile are not affected.
        </p>
        <p class="text-body-2">
          <strong>Delete account</strong> permanently removes your profile, answers, and habit data.
          This cannot be undone.
        </p>
      </v-card-text>
    </v-card>
  </section>
</template>
