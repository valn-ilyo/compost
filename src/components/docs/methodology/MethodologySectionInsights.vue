<script setup lang="ts">
// No data derivation. Static prose derived from getInsightsForAssessment in
// src/data/insights/index.ts and the QuestionInsight type in app.types.ts.
</script>

<template>
  <div class="text-overline text-medium-emphasis px-1 mb-1">Insights algorithm</div>

  <v-card flat rounded="xl" class="mb-8">
    <v-card-text class="pb-1">
      <p class="text-body-2 mb-2">
        The Insights tab selects exactly five questions from the completed assessment to surface as
        actionable insights. It follows a deterministic algorithm that prioritises the user's
        weakest areas while always reserving one slot for positive reinforcement.
      </p>
      <p class="text-body-2">
        The algorithm runs against the same sorted question pool used for habit recommendations,
        where questions are ordered by section weakness first and raw score ascending within each
        section.
      </p>
    </v-card-text>

    <v-divider />

    <v-list-item title="Slot allocation: slots 1–4" class="pt-2" />
    <v-card-text class="pt-1 pb-3">
      <p class="text-body-2 mb-2">
        The number of weak sections (those scoring below 50% of their maximum) determines how slots
        1–4 are distributed:
      </p>
      <v-table density="compact" class="mb-2">
        <thead>
          <tr>
            <th class="text-left text-body-2">Weak sections</th>
            <th class="text-left text-body-2">Distribution</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-body-2">0 (default)</td>
            <td class="text-body-2">Treated as broad, using section order</td>
          </tr>
          <tr>
            <td class="text-body-2">1 (focused)</td>
            <td class="text-body-2">4 from the one weak section</td>
          </tr>
          <tr>
            <td class="text-body-2">2 (dual)</td>
            <td class="text-body-2">2 from section 1, 2 from section 2</td>
          </tr>
          <tr>
            <td class="text-body-2">3+ (broad)</td>
            <td class="text-body-2">2 from section 1, 1 from section 2, 1 from section 3</td>
          </tr>
        </tbody>
      </v-table>
      <p class="text-body-2">
        When no weak sections exist, the algorithm falls back to broad distribution using the
        natural section order rather than skipping the selection entirely.
      </p>
    </v-card-text>

    <v-divider />

    <v-list-item title="Slot 5: the affirmation slot" class="pt-2" />
    <v-card-text class="pt-1 pb-3">
      <p class="text-body-2 mb-2">
        After slots 1–4 are filled, the remaining question pool is iterated from strongest to
        weakest looking for a question with a score of 4 or higher. If one is found, it occupies
        slot 5 and renders in green in the Insights view, indicating a behaviour the user is already
        performing well.
      </p>
      <p class="text-body-2">
        If no question with a score of 4 or higher remains, the worst remaining question fills the
        slot and renders in the default style. There is no explicit affirmation flag on the insight
        object: the view determines colour by checking the score directly.
      </p>
    </v-card-text>

    <v-divider />

    <v-list-item title="The noHabit flag" class="pt-2" />
    <v-card-text class="pt-1 pb-4">
      <p class="text-body-2 mb-2">
        Some questions are marked <code>noHabit: true</code> in the insights data. The
        <code>commute_distance</code> question is the primary example: it asks how far a user lives
        from their daily destination, which is a fixed structural fact rather than a repeatable
        daily behaviour.
      </p>
      <p class="text-body-2">
        When an insight for a <code>noHabit</code> question is displayed, the habit-add call to
        action is suppressed. This is a deliberate methodological choice. Showing a habit prompt for
        a question the user can't act on daily would be misleading and reduce the usefulness of the
        recommendations. The insight text still appears, because distance is worth knowing, but no
        habit is suggested.
      </p>
    </v-card-text>
  </v-card>
</template>
