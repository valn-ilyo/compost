<script setup lang="ts">
import { SECTIONS, questionRegistry } from "@/data/index";

const totalScaledMax = SECTIONS.reduce((sum, s) => sum + s.scaledMax, 0);

const sectionRows = SECTIONS.map((s) => ({
  label: s.label,
  questions: questionRegistry[s.id]?.length ?? 0,
  maxRaw: s.maxRaw,
  scaledMax: s.scaledMax,
  weight: ((s.scaledMax / totalScaledMax) * 100).toFixed(1) + "%",
}));
</script>

<template>
  <div class="text-overline text-medium-emphasis px-1 mb-1">Overview</div>
  <v-card flat rounded="xl" class="mb-8">
    <v-card-text>
      <p class="text-body-2 mb-3">
        Compost estimates a user's personal environmental footprint across seven behavioural domains
        using a structured self-assessment. Responses are aggregated into a single normalised score
        between 0 and 100.
      </p>
      <p class="text-body-2">
        This document describes the scoring model, the basis for section weighting, the habit
        tracking system, and the limitations of the approach.
      </p>
    </v-card-text>
  </v-card>

  <div class="text-overline text-medium-emphasis px-1 mb-1">Assessment structure</div>
  <v-card flat rounded="xl" class="mb-8">
    <v-card-text class="pb-1">
      <p class="text-body-2 mb-3">
        The assessment comprises seven sections covering the principal domains of personal
        environmental impact: transport, food and diet, energy use, consumption, waste, water, and
        digital habits.
      </p>
      <p class="text-body-2 mb-4">
        Questions are presented as single-select ordinal items with five response options, scored
        from 1 (highest impact) to 5 (lowest impact). Sections can be completed in any order. Each
        section is submitted once and cannot be edited after submission.
      </p>
    </v-card-text>

    <v-divider />

    <v-table density="comfortable">
      <thead>
        <tr>
          <th class="text-left text-body-2">Section</th>
          <th class="text-left text-body-2">Questions</th>
          <th class="text-left text-body-2">Raw max</th>
          <th class="text-left text-body-2">Scaled max</th>
          <th class="text-left text-body-2">Weight</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in sectionRows" :key="row.label">
          <td class="text-body-2">{{ row.label }}</td>
          <td class="text-body-2 text-medium-emphasis">{{ row.questions }}</td>
          <td class="text-body-2 text-medium-emphasis">{{ row.maxRaw }}</td>
          <td class="text-body-2 text-medium-emphasis">{{ row.scaledMax }}</td>
          <td class="text-body-2 text-medium-emphasis">{{ row.weight }}</td>
        </tr>
        <tr>
          <td class="text-body-2 font-weight-medium">Total</td>
          <td class="text-body-2 text-medium-emphasis">
            {{ sectionRows.reduce((n, r) => n + r.questions, 0) }}
          </td>
          <td class="text-body-2 text-medium-emphasis">
            {{ sectionRows.reduce((n, r) => n + r.maxRaw, 0) }}
          </td>
          <td class="text-body-2 text-medium-emphasis">{{ totalScaledMax }}</td>
          <td class="text-body-2 text-medium-emphasis">100%</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>
