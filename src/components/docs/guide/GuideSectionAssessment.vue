<!-- Component -- guide assessment section, section overview with weight table -->
<script setup lang="ts">
import { computed } from 'vue'
import { SECTIONS, questionRegistry } from '@/data/registry'

const totalScaledMax = SECTIONS.reduce((sum, s) => sum + s.scaledMax, 0)

const sectionRows = computed(() =>
  SECTIONS.map((s) => ({
    label: s.label,
    questions: questionRegistry[s.id]?.length ?? 0,
    weight: Math.round((s.scaledMax / totalScaledMax) * 100),
  })),
)
</script>

<template>
  <section id="assessment">
    <div class="text-overline text-medium-emphasis px-1 mb-1">Assessment</div>
    <v-card flat rounded="xl" class="mb-8">
      <v-card-text class="pb-1">
        <p class="text-body-2 mb-3">
          The assessment has seven sections. You can complete them in any order and return to finish
          them whenever you want.
        </p>
        <p class="text-body-2 mb-3">
          Each section carries a different weight. Transport and food together account for about 46%
          of the total score because they tend to dominate personal footprints.
        </p>
        <p class="text-body-2 mb-3">
          A partial score will be low until all sections are done. The score always normalises
          against the full {{ totalScaledMax }}-point total, even if you've only completed some
          sections.
        </p>
        <p class="text-body-2 mb-4">
          You can't edit a section once it's submitted. Resetting your answers starts over
          completely.
        </p>
      </v-card-text>

      <v-divider />

      <v-table density="comfortable">
        <thead>
          <tr>
            <th class="text-left text-body-2">Section</th>
            <th class="text-left text-body-2">Questions</th>
            <th class="text-left text-body-2">Weight</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in sectionRows" :key="row.label">
            <td class="text-body-2">{{ row.label }}</td>
            <td class="text-body-2 text-medium-emphasis">{{ row.questions }}</td>
            <td class="text-body-2 text-medium-emphasis">{{ row.weight }}%</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </section>
</template>
