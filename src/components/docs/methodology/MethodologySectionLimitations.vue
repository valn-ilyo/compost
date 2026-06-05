<!-- Component -- methodology limitations section, caveats and references -->
<script setup lang="ts">
import { SECTIONS } from '@/data/registry'

const totalScaledMax = SECTIONS.reduce((sum, s) => sum + s.scaledMax, 0)
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

  <div class="text-overline text-medium-emphasis px-1 mb-1">References</div>
  <VCard flat rounded="xl" class="mb-8">
    <VCardText>
      <p class="text-body-2 mb-2">
        Ellen MacArthur Foundation. (2019).
        <em>Completing the picture: How the circular economy tackles climate change.</em>
      </p>
      <p class="text-body-2 mb-2">
        FAO. (2013). <em>Food wastage footprint: Impacts on natural resources.</em>
        Food and Agriculture Organization of the United Nations.
      </p>
      <p class="text-body-2 mb-2">
        Freitag, C., Berners-Lee, M., Widdicks, K., Knowles, B., Blair, G., &amp; Friday, A. (2021).
        The real climate and transformative impact of ICT: A critique of estimates, trends, and
        regulations. <em>Patterns, 2</em>(9).
      </p>
      <p class="text-body-2 mb-2">
        International Energy Agency. (2022). <em>World energy outlook 2022.</em> IEA.
      </p>
      <p class="text-body-2 mb-2">
        International Energy Agency. (2023). <em>Global EV outlook 2023.</em> IEA.
      </p>
      <p class="text-body-2">
        Poore, J., &amp; Nemecek, T. (2018). Reducing food's environmental impacts through producers
        and consumers. <em>Science, 360</em>(6392), 987–992.
      </p>
    </VCardText>
  </VCard>
</template>
