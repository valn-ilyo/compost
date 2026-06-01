<!-- Component -- methodology scoring section, raw score, scaled score, and section weighting -->
<script setup lang="ts">
import { SECTIONS } from "@/data/registry";

const totalScaledMax = SECTIONS.reduce((sum, s) => sum + s.scaledMax, 0);
</script>

<template>
  <div class="text-overline text-medium-emphasis px-1 mb-1">Scoring model</div>
  <v-card flat rounded="xl" class="mb-8">
    <v-list-item title="Raw score" class="pt-4" />
    <v-card-text class="pt-1 pb-3">
      <p class="text-body-2">
        The raw score for a section is the sum of point values across all answered questions. The
        maximum raw score equals the question count multiplied by 5.
      </p>
    </v-card-text>

    <v-divider />

    <v-list-item title="Scaled score" class="pt-2" />
    <v-card-text class="pt-1 pb-3">
      <p class="text-body-2 mb-2">The raw score is scaled to the section's weighted maximum:</p>
      <p class="text-body-2 text-medium-emphasis font-weight-medium mb-2">
        scaledScore = round( rawScore / maxRaw × scaledMax )
      </p>
      <p class="text-body-2">
        This converts each section into a common weighted space. A perfect section score always
        contributes its full scaled maximum regardless of how many questions it contains.
      </p>
    </v-card-text>

    <v-divider />

    <v-list-item title="Normalised score" class="pt-2" />
    <v-card-text class="pt-1 pb-4">
      <p class="text-body-2 mb-2">
        The overall score normalises completed section totals against the full
        {{ totalScaledMax }}-point maximum:
      </p>
      <p class="text-body-2 text-medium-emphasis font-weight-medium mb-2">
        score = round( Σ scaledScore / {{ totalScaledMax }} × 100 )
      </p>
      <p class="text-body-2">
        The denominator is always {{ totalScaledMax }}, not the sum of completed sections' maxima. A
        partial assessment produces a score that is structurally lower than a fully completed one at
        equivalent per-section performance. The app makes this explicit while the assessment is
        incomplete.
      </p>
    </v-card-text>
  </v-card>

  <div class="text-overline text-medium-emphasis px-1 mb-1">Section weighting</div>
  <v-card flat rounded="xl" class="mb-8">
    <v-card-text class="pb-1">
      <p class="text-body-2 mb-4">
        Section weights reflect the relative contribution of each domain to total personal
        greenhouse gas emissions, drawing on lifecycle and consumption-pattern research.
      </p>
    </v-card-text>

    <v-divider />

    <v-list-item title="Transport and food (23.1% each)" class="pt-2" />
    <v-card-text class="pt-1 pb-3">
      <p class="text-body-2">
        Personal vehicles account for approximately 75% of all passenger-transport CO₂ emissions
        globally. Animal-sourced foods contribute 56–58% of food-related greenhouse gas emissions
        while providing approximately 37% of global protein supply. These two domains are the
        highest-leverage areas for most individuals and are weighted equally at the top.
      </p>
    </v-card-text>

    <v-divider />

    <v-list-item title="Energy (15.4%)" class="pt-2" />
    <v-card-text class="pt-1 pb-3">
      <p class="text-body-2">
        Residential energy accounts for approximately 20% of global energy-related CO₂ emissions.
        Per-user impact varies substantially with national grid carbon intensity, which is why it is
        weighted below transport and food rather than alongside them.
      </p>
    </v-card-text>

    <v-divider />

    <v-list-item title="Consumption (12.3%)" class="pt-2" />
    <v-card-text class="pt-1 pb-3">
      <p class="text-body-2">
        Manufacturing consumer goods accounts for approximately 45% of global emissions when full
        supply chains are included. Individual consumption share is highly variable, which gives
        this section a mid-range weight.
      </p>
    </v-card-text>

    <v-divider />

    <v-list-item title="Waste (10.8%)" class="pt-2" />
    <v-card-text class="pt-1 pb-3">
      <p class="text-body-2">
        Approximately one-third of all food produced globally is lost or wasted, representing around
        3.3 billion tonnes of CO₂eq annually. Waste behaviour also amplifies the impact of decisions
        made in other sections, particularly food and consumption.
      </p>
    </v-card-text>

    <v-divider />

    <v-list-item title="Water and digital (7.7% each)" class="pt-2" />
    <v-card-text class="pt-1 pb-4">
      <p class="text-body-2">
        Water consumption affects energy use and local resource stress, but its greenhouse gas
        contribution is indirect and context-dependent. Digital infrastructure contributes an
        estimated 2–4% of global emissions, with individual impact concentrated in streaming, device
        charging, and replacement cycles.
      </p>
    </v-card-text>
  </v-card>
</template>
