<!-- Component -- methodology questions section, per-question environmental rationale grouped by section -->
<script setup lang="ts">
import { SECTIONS, questionRegistry } from '@/data/registry'

// TODO(valn): add inline citations to each whyItMatters string once sources are
// confirmed with the content researchers. See docs coverage guide §1 for
// the full list of strings that need attribution.
const sectionGroups = SECTIONS.map((section) => ({
  meta: section,
  questions: questionRegistry[section.id] ?? [],
}))
</script>

<template>
  <div class="text-overline text-medium-emphasis px-1 mb-1">Questions</div>

  <VCard flat rounded="xl" class="mb-8">
    <VCardText>
      <p class="text-body-2 mb-2">
        Each question in the assessment is grounded in a specific environmental rationale. The text
        below explains why each question was included and what behaviour it targets.
      </p>
      <p class="text-body-2">
        Questions are grouped by section. The rationale text is the same text shown in the
        assessment info panel.
      </p>
    </VCardText>
  </VCard>

  <template v-for="group in sectionGroups" :key="group.meta.id">
    <div class="text-overline text-medium-emphasis px-1 mb-1">
      {{ group.meta.label }}
    </div>

    <VCard flat rounded="xl" class="mb-6">
      <VExpansionPanels variant="accordion" :elevation="0">
        <VExpansionPanel v-for="question in group.questions" :key="question.id">
          <VExpansionPanelTitle class="text-body-2">
            {{ question.text }}
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <p class="text-body-2 text-medium-emphasis">
              {{ question.whyItMatters }}
              <!-- TODO(valn): cite - source pending confirmation from content researchers -->
            </p>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </VCard>
  </template>
</template>
