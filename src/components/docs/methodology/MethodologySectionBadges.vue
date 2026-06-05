<!-- Component -- methodology badges section, badge tiers and tagline variant logic -->
<script setup lang="ts">
import { BADGES, WEAK_THRESHOLD } from '@/data/badge'
</script>

<template>
  <div class="text-overline text-medium-emphasis px-1 mb-1">Badge taxonomy</div>
  <v-card flat rounded="xl" class="mb-8">
    <v-card-text class="pb-1">
      <p class="text-body-2 mb-3">
        The normalised score maps to one of {{ BADGES.length }} badge tiers. Thresholds are
        calibrated toward an urban Indian context, where most users are expected to fall in the
        30–65 range on first assessment.
      </p>
      <p class="text-body-2 mb-4">
        A contextual tagline accompanies each badge. The variant shown depends on the number and
        identity of weak sections (those where the scaled score falls below
        {{ Math.round(WEAK_THRESHOLD * 100) }}% of the section maximum). A single weak section
        triggers a section-specific tagline. Two weak sections trigger a split variant. Three or
        more trigger a broad variant. A clean profile shows the badge's default tagline.
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
</template>
