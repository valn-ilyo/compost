<script setup lang="ts">
import { FREEZE_MILESTONE, MASTERY_MILESTONE, MAX_SLOTS } from "@/types/app";
</script>

<template>
  <div class="text-overline text-medium-emphasis px-1 mb-1">Habit tracking</div>
  <v-card flat rounded="xl" class="mb-8">
    <v-card-text class="pb-1">
      <p class="text-body-2">
        Each habit in the library maps to one or more specific assessment questions via a
        <code>covers</code> field. A habit that covers <code>food → diet_type</code> is surfaced
        when that question scores poorly. This mapping is the basis for both the insight
        recommendations on the Insights tab and the habit library suggestions. One explanation of
        this principle covers all habits; individual per-habit justifications are not listed
        separately.
      </p>
    </v-card-text>

    <v-divider />

    <v-list-item title="Streaks" class="pt-4" />
    <v-card-text class="pt-1 pb-3">
      <p class="text-body-2 mb-2">
        A streak counts consecutive days on which a habit was logged as completed. It increments by
        1 for each consecutive Yes log and resets to 0 on a missed day, subject to the freeze token
        rule. A No log does not increment the streak but does not trigger a reset either.
      </p>
      <p class="text-body-2">
        Streak calculation runs against UTC date at reconciliation time. A log submitted at any
        point before midnight UTC counts for that day.
      </p>
    </v-card-text>

    <v-divider />

    <v-list-item title="Freeze tokens" class="pt-2" />
    <v-card-text class="pt-1 pb-3">
      <p class="text-body-2 mb-2">
        A freeze token is earned for every {{ FREEZE_MILESTONE }} consecutive Yes logs. The balance
        cap is {{ MAX_SLOTS }}. When a day passes with no log and at least one token is held, the
        reconciler spends one token and preserves the streak.
      </p>
      <p class="text-body-2">
        When two or more habits share the same streak and the reconciler reaches that group with at
        least one token available, it saves all habits in the group together, decrementing one token
        per habit. The token balance may go negative (debt), clamped at a floor of −2. This
        eliminates the ordering bias that would otherwise determine which tied habits are saved. A
        group that is reached with zero or fewer tokens receives no protection and all habits in it
        lose their streak.
      </p>
    </v-card-text>

    <v-divider />

    <v-list-item title="Mastery" class="pt-2" />
    <v-card-text class="pt-1 pb-4">
      <p class="text-body-2 mb-2">
        A habit is mastered after a streak of {{ MASTERY_MILESTONE }} consecutive Yes logs. On
        reaching this threshold, the habit moves to the mastered archive and the user receives one
        freeze token unconditionally, even when the balance is already at {{ MAX_SLOTS }}. While
        above the cap, normal {{ FREEZE_MILESTONE }}-day milestone grants are suppressed. The
        balance returns toward {{ MAX_SLOTS }} as tokens are spent on missed days.
      </p>
      <p class="text-body-2">
        Mastered habits are excluded from daily logging and from the
        {{ FREEZE_MILESTONE }}-day freeze milestone. Tapping a mastered habit opens the retire
        sheet, which removes it from the active slot and adds it to the permanent archive.
      </p>
    </v-card-text>
  </v-card>
</template>
