<script setup lang="ts">
import { FREEZE_MILESTONE, MASTERY_MILESTONE, MAX_SLOTS } from "@/types/app";
</script>

<template>
  <section id="habits-and-mastery">
    <div class="text-overline text-medium-emphasis px-1 mb-1">Habits and mastery</div>
    <v-card flat rounded="xl" class="mb-8">
      <!-- Streaks -->
      <v-list-item prepend-icon="mdi-fire" title="Streaks" class="pt-4" />
      <v-card-text class="pt-1 pb-3">
        <p class="text-body-2 mb-2">
          A streak counts how many consecutive days you've logged a habit as done. It resets to 0 if
          you miss a day without a freeze available.
        </p>
        <p class="text-body-2">
          Streaks are calculated at the end of each day, not in real time. Logging before midnight
          counts for that day.
        </p>
      </v-card-text>

      <v-divider />

      <!-- Freeze tokens -->
      <v-list-item prepend-icon="mdi-snowflake" title="Freeze tokens" class="pt-2" />
      <v-card-text class="pt-1 pb-3">
        <p class="text-body-2 mb-2">A freeze protects your streak when you miss a day entirely.</p>
        <p class="text-body-2 mb-2">
          You earn one for every {{ FREEZE_MILESTONE }} consecutive Yes logs. You can hold up to
          {{ MAX_SLOTS }}.
        </p>
        <p class="text-body-2">
          Miss a day with freezes available and the app spends one on your behalf.
        </p>
      </v-card-text>

      <v-divider />

      <!-- Freeze overflow -->
      <v-list-item prepend-icon="mdi-snowflake" title="Freeze overflow" class="pt-2" />
      <v-card-text class="pt-1 pb-3">
        <p class="text-body-2 mb-2">
          Mastering a habit always grants a freeze, even at {{ MAX_SLOTS }}/{{ MAX_SLOTS }}.
        </p>
        <p class="text-body-2 mb-2">
          While above the cap, normal {{ FREEZE_MILESTONE }}-day milestones don't add more.
        </p>
        <p class="text-body-2">
          The count drops back toward {{ MAX_SLOTS }} as freezes are spent on missed days.
        </p>
      </v-card-text>

      <v-divider />

      <!-- Freeze debt -->
      <v-list-item prepend-icon="mdi-snowflake-alert" title="Freeze debt" class="pt-2" />
      <v-card-text class="pt-1 pb-4">
        <p class="text-body-2 mb-2">
          When two or more of your habits share the same streak and you miss a day, the app covers
          all of them even if you'd run short, as long as you had at least one token when the group
          was reached. Your freeze count drops below zero. That's debt.
        </p>
        <p class="text-body-2 mb-2">
          Each freeze you earn through consistent Yes logs brings the balance back toward zero.
          While you're in debt, solo habits (those with a unique streak length) won't be protected
          on a missed day.
        </p>
        <p class="text-body-2">
          Debt is capped at −2. No matter how many habits are covered on credit, the counter won't
          go below that.
        </p>
      </v-card-text>

      <v-divider />

      <!-- Mastery -->
      <v-list-item prepend-icon="mdi-check-decagram-outline" title="Mastery" class="pt-2" />
      <v-card-text class="pt-1 pb-3">
        <p class="text-body-2 mb-2">
          A habit is mastered after a {{ MASTERY_MILESTONE }}-day streak. It moves to a separate
          section in your library.
        </p>
        <p class="text-body-2">
          Mastered habits can't be logged. Tapping one opens the retire sheet, which lets you free
          the slot.
        </p>
      </v-card-text>
    </v-card>
  </section>
</template>
