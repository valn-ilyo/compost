<!-- Component -- methodology limitations section, caveats on scoring accuracy -->
<script setup lang="ts">
import { SECTIONS } from "@/data/registry";

const totalScaledMax = SECTIONS.reduce((sum, s) => sum + s.scaledMax, 0);
</script>

<template>
  <div class="text-overline text-medium-emphasis px-1 mb-1">Limitations</div>
  <VCard flat rounded="xl" class="mb-8">
    <VListItem title="Self-reported data" class="pt-4" />
    <VCardText class="pt-1 pb-3">
      <p class="text-body-2">
        The assessment relies entirely on user self-report. No behavioural data is collected
        passively. Response accuracy depends on the user's recall and willingness to answer
        honestly. The score is a relative indicator, not a precise carbon accounting figure.
      </p>
    </VCardText>

    <VDivider />

    <VListItem title="Ordinal approximation" class="pt-2" />
    <VCardText class="pt-1 pb-3">
      <p class="text-body-2">
        Converting behavioural frequency to a 1–5 ordinal scale loses information. Two users
        selecting the same option may have substantially different actual footprints. The five-point
        resolution is a deliberate trade-off of precision for usability.
      </p>
    </VCardText>

    <VDivider />

    <VListItem title="Fixed weights" class="pt-2" />
    <VCardText class="pt-1 pb-3">
      <p class="text-body-2">
        Section weights are fixed and derived from global and regional averages. Factors such as
        grid carbon intensity, local transport infrastructure, and climate affect the true relative
        importance of each domain. A user on a near-zero-carbon electricity grid is over-penalised
        in the Energy section relative to their actual impact.
      </p>
    </VCardText>

    <VDivider />

    <VListItem title="Partial assessment scores" class="pt-2" />
    <VCardText class="pt-1 pb-4">
      <p class="text-body-2">
        Because the normalised score always divides by the full {{ totalScaledMax }}-point maximum,
        a partial assessment produces a score that cannot be directly compared to a complete one. A
        partial score is not representative of a user's full profile.
      </p>
    </VCardText>
  </VCard>
</template>
