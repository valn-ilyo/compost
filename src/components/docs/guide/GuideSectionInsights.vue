<!-- Component -- guide insights section, score, breakdown, recommendations, and SDG alignment -->
<template>
  <section id="insights">
    <div class="text-overline text-medium-emphasis px-1 mb-1">Insights</div>
    <VCard flat rounded="xl" class="mb-8">
      <VCardText class="pb-1">
        <p class="text-body-2 mb-3">
          The Insights tab shows your score, a section-by-section breakdown, habit recommendations,
          and the SDGs your profile touches.
        </p>
        <p class="text-body-2 mb-4">
          The score and badge only reflect your full picture once all seven sections are done. While
          the assessment is incomplete, the tab shows a partial score and tells you how far along
          you are.
        </p>
      </VCardText>

      <VDivider />

      <VListItem prepend-icon="mdi-chart-donut" title="Score and badge" class="pt-2" />
      <VCardText class="pt-1 pb-3">
        <p class="text-body-2">
          Your normalised score out of 100, your current badge, and a contextual tagline based on
          which sections are weakest.
        </p>
      </VCardText>

      <VDivider />

      <VListItem prepend-icon="mdi-equalizer" title="Section breakdown" class="pt-2" />
      <VCardText class="pt-1 pb-3">
        <p class="text-body-2">
          A bar for each completed section, coloured by how it scores relative to its own maximum.
          Sections that score below 50% of their maximum are flagged as weak.
        </p>
      </VCardText>

      <VDivider />

      <VListItem prepend-icon="mdi-lightbulb-outline" title="Five insights" class="pt-2" />
      <VCardText class="pt-1 pb-3">
        <p class="text-body-2 mb-2">
          After completing the assessment, five questions from your results are highlighted as
          insights. They're drawn from your weakest sections when any exist, so the focus lands
          where it would make the most difference.
        </p>
        <p class="text-body-2">
          Any insight with a high score appears in green. That means it's something you're already
          doing well. The fifth slot in particular looks for a high-scoring question first, so
          there's usually at least one positive in the set.
        </p>
      </VCardText>

      <VDivider />

      <VListItem prepend-icon="mdi-playlist-check" title="Habit recommendations" class="pt-2" />
      <VCardText class="pt-1 pb-3">
        <p class="text-body-2">
          Habits drawn from the library that map to your weakest sections. If your habit slots are
          full, the panel shows what you're already working on instead.
        </p>
      </VCardText>

      <VDivider />

      <VListItem prepend-icon="mdi-leaf" title="SDG alignment" class="pt-2" />
      <VCardText class="pt-1 pb-4">
        <p class="text-body-2">
          The "Sustainable Development Goals" your assessment answers relate to. Each chip's colour
          reflects how you're scoring in the sections that map to that goal.
        </p>
      </VCardText>
    </VCard>
  </section>
</template>
