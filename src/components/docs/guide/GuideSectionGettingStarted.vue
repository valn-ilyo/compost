<!-- Component -- guide getting started section, sign-in, assessment, habits, and daily logging steps -->
<script setup lang="ts">
import { MAX_SLOTS } from '@/types/app.types'
</script>

<template>
  <section id="getting-started">
    <div class="text-overline text-medium-emphasis px-1 mb-1">Getting started</div>
    <v-card flat rounded="xl" class="mb-8">
      <v-list-item prepend-icon="mdi-account-circle-outline" title="Sign in" class="pt-4" />
      <v-card-text class="pt-1 pb-3">
        <p class="text-body-2">
          Sign in with Google. No password or separate account needed. Your data is tied to your
          Google account and syncs across devices automatically.
        </p>
      </v-card-text>

      <v-divider />

      <v-list-item
        prepend-icon="mdi-clipboard-list-outline"
        title="Complete the assessment"
        class="pt-2"
      />
      <v-card-text class="pt-1 pb-3">
        <p class="text-body-2 mb-2">
          The assessment has seven sections. You can do them in any order and return to finish them
          later.
        </p>
        <p class="text-body-2">
          Each section is submitted once. You can't edit answers after submitting. Resetting a
          section starts it over completely.
        </p>
      </v-card-text>

      <v-divider />

      <v-list-item prepend-icon="mdi-playlist-plus" title="Add habits" class="pt-2" />
      <v-card-text class="pt-1 pb-3">
        <p class="text-body-2 mb-2">
          Go to the Mastery tab and open the habit library. Each habit covers one or more assessment
          questions, so picking habits in your weak sections is usually the highest-leverage move.
        </p>
        <p class="text-body-2">
          You can track up to {{ MAX_SLOTS }} habits at a time. Swap them out as your situation
          changes.
        </p>
      </v-card-text>

      <v-divider />

      <v-list-item prepend-icon="mdi-check-circle-outline" title="Log every day" class="pt-2" />
      <v-card-text class="pt-1 pb-4">
        <p class="text-body-2 mb-2">
          Log each habit as Yes or No before midnight. Yes builds your streak. No is an honest log
          and keeps your streak at its current length without resetting it.
        </p>
        <p class="text-body-2">
          Missing a day entirely resets the streak, unless you have a freeze token available.
        </p>
      </v-card-text>
    </v-card>
  </section>
</template>
