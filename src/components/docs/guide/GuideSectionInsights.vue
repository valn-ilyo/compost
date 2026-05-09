<script setup lang="ts">
// No data derivation. Static prose.
</script>

<template>
  <section id="insights">
    <div class="text-overline text-medium-emphasis px-1 mb-1">Insights</div>
    <v-card flat rounded="xl" class="mb-8">
      <v-card-text class="pb-1">
        <p class="text-body-2 mb-3">
          The Insights tab shows your score, a section-by-section breakdown, habit recommendations,
          and the SDGs your profile touches.
        </p>
        <p class="text-body-2 mb-4">
          The score and badge only reflect your full picture once all seven sections are done. While
          the assessment is incomplete, the tab shows a partial score and tells you how far along
          you are.
        </p>
      </v-card-text>

      <v-divider />

      <v-list-item prepend-icon="mdi-chart-donut" title="Score and badge" class="pt-2" />
      <v-card-text class="pt-1 pb-3">
        <p class="text-body-2">
          Your normalised score out of 100, your current badge, and a contextual tagline based on
          which sections are weakest.
        </p>
      </v-card-text>

      <v-divider />

      <v-list-item prepend-icon="mdi-equalizer" title="Section breakdown" class="pt-2" />
      <v-card-text class="pt-1 pb-3">
        <p class="text-body-2">
          A bar for each completed section, coloured by how it scores relative to its own maximum.
          Sections that score below 50% of their maximum are flagged as weak.
        </p>
      </v-card-text>

      <v-divider />

      <v-list-item prepend-icon="mdi-playlist-check" title="Habit recommendations" class="pt-2" />
      <v-card-text class="pt-1 pb-3">
        <p class="text-body-2">
          Habits drawn from the library that map to your weakest sections. If your habit slots are
          full, the panel shows what you're already working on instead.
        </p>
      </v-card-text>

      <v-divider />

      <v-list-item prepend-icon="mdi-leaf" title="SDG alignment" class="pt-2" />
      <v-card-text class="pt-1 pb-4">
        <p class="text-body-2">
          The Sustainable Development Goals your assessment answers relate to. The chips are
          coloured by how well your habits are performing in each area.
        </p>
      </v-card-text>
    </v-card>
  </section>
</template>
