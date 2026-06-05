<!-- Component -- guide score section, badge tiers and weak threshold explanation -->
<script setup lang="ts">
import { BADGES, WEAK_THRESHOLD } from '@/data/badge'
</script>

<template>
  <section id="score-and-badges">
    <div class="text-overline text-medium-emphasis px-1 mb-1">Score and badges</div>
    <v-card flat rounded="xl" class="mb-8">
      <v-card-text class="pb-1">
        <p class="text-body-2 mb-3">
          Your score runs from 0 to 100. It's calculated across all seven sections, each weighted by
          how much it contributes to your total footprint.
        </p>
        <p class="text-body-2 mb-3">
          A section is weak when its score is below {{ Math.round(WEAK_THRESHOLD * 100) }}% of its
          maximum. The app uses this to determine which sections to flag and which advice to show.
        </p>
        <p class="text-body-2 mb-4">
          Your badge reflects where your overall score lands. The label is a marker, not a judgment.
        </p>
      </v-card-text>

      <v-divider />

      <v-table density="comfortable">
        <thead>
          <tr>
            <th class="text-left text-body-2">Badge</th>
            <th class="text-left text-body-2">Score range</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="badge in BADGES" :key="badge.id">
            <td class="text-body-2">{{ badge.label }}</td>
            <td class="text-body-2 text-medium-emphasis">
              {{ badge.minScore }}–{{ badge.maxScore }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </section>
</template>
