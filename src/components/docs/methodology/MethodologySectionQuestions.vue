<!-- Component -- methodology questions section, per-question environmental rationale grouped by section -->
<script setup lang="ts">
import { SECTIONS, questionRegistry } from "@/data/registry";
import { getRefNums } from "@/data/docs/methodology-refs";

const emit = defineEmits<{ goReferences: [] }>();

const sectionGroups = SECTIONS.map((section) => ({
  meta: section,
  questions: questionRegistry[section.id] ?? [],
}));
</script>

<template>
  <div class="text-overline text-medium-emphasis px-1 mb-1">Questions</div>

  <VCard flat rounded="xl">
    <VCardText class="py-0">
      <p class="text-body-2 mb-1">
        Each question in the assessment is grounded in a specific environmental rationale. The text
        below explains why each question was included and what behaviour it targets.
      </p>
      <p class="text-body-2">
        Questions are grouped by section. The rationale text is the same text shown in the
        assessment info panel. Inline numbers link to the full bibliography in the
        <span
          class="text-decoration-underline text-primary"
          style="cursor: pointer"
          @click="emit('goReferences')"
          >References</span
        >
        section.
      </p>
    </VCardText>
  </VCard>

  <template v-for="group in sectionGroups" :key="group.meta.id">
    <VCard flat rounded="xl" class="mb-4">
      <VExpansionPanels variant="accordion" :elevation="0" :model-value="0">
        <VExpansionPanel>
          <VExpansionPanelTitle>
            <span class="text-overline text-medium-emphasis">{{ group.meta.label }}</span>
          </VExpansionPanelTitle>
          <VExpansionPanelText class="pt-0">
            <template v-for="(question, qi) in group.questions" :key="question.id">
              <div class="py-3">
                <p class="text-body-2 font-weight-medium mb-1">{{ question.text }}</p>
                <p class="text-body-2 text-medium-emphasis mb-1">
                  {{ question.whyItMatters
                  }}<template v-if="getRefNums(question.id).length"
                    ><sup
                      v-for="n in getRefNums(question.id)"
                      :key="n"
                      class="text-caption text-primary ml-1"
                      style="cursor: pointer"
                      role="button"
                      tabindex="0"
                      :aria-label="`Go to reference ${n}`"
                      @click="emit('goReferences')"
                      @keydown.enter="emit('goReferences')"
                      >[{{ n }}]</sup
                    ></template
                  >
                </p>
              </div>
              <VDivider v-if="qi < group.questions.length - 1" />
            </template>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </VCard>
  </template>
</template>
