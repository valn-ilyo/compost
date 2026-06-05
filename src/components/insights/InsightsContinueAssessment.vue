<!-- Component -- incomplete assessment prompt, links to each unfinished section -->
<script setup lang="ts">
import { ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'

defineProps<{
  sections: Array<{
    id: string
    label: string
    icon: string
    description: string
  }>
}>()

const tooltipWidths = ref<Record<string, number>>({})

function measureTooltip(el: Element | ComponentPublicInstance | null, id: string) {
  if (el && '$el' in el) {
    tooltipWidths.value[id] = (el.$el as HTMLElement).getBoundingClientRect().width
  }
}
</script>

<template>
  <p
    v-motion
    :initial="{ opacity: 0, y: 10 }"
    :enter="{
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 22, delay: 80 },
    }"
    class="text-overline text-medium-emphasis mb-3"
  >
    Keep going
  </p>

  <v-row density="comfortable">
    <v-col
      v-for="(section, i) in sections"
      :key="section.id"
      v-motion
      :initial="{ opacity: 0, x: -20 }"
      :enter="{
        opacity: 1,
        x: 0,
        transition: { type: 'spring', stiffness: 300, damping: 22, delay: 120 + i * 80 },
      }"
      cols="12"
      md="6"
    >
      <v-hover v-slot="{ isHovering, props: hoverProps }">
        <v-list
          v-bind="hoverProps"
          rounded
          bg-color="tertiary-container"
          class="pa-1"
          :style="{
            transform: isHovering ? 'scale(1.025)' : 'scale(1)',
            boxShadow: isHovering ? '0 6px 24px rgba(0,0,0,0.12)' : '0 0px 0px rgba(0,0,0,0)',
            transition: 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms ease',
          }"
        >
          <v-tooltip
            :text="section.description"
            location="top"
            :content-props="{
              style: `max-width: ${tooltipWidths[section.id] ?? 200}px; white-space: normal;`,
            }"
          >
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                :ref="(el) => measureTooltip(el, section.id)"
                :to="`/assessment/${section.id}`"
                :title="section.label"
                :prepend-icon="section.icon"
                append-icon="mdi-chevron-double-right"
                rounded
              />
            </template>
          </v-tooltip>
        </v-list>
      </v-hover>
    </v-col>
  </v-row>
</template>
