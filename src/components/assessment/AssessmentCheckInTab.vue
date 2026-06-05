<!-- Component -- assessment check-in tab, section cards sorted by completion with time hints -->
<script setup lang="ts">
import { useAssessmentStore } from '@/stores/assessment.store'
import { SECTIONS } from '@/data/registry'
import { computed } from 'vue'

const store = useAssessmentStore()

const sortedSections = computed(() =>
  [...SECTIONS].sort((a, b) => {
    const aComplete = store.isCompleted(a.id) ? 1 : 0
    const bComplete = store.isCompleted(b.id) ? 1 : 0
    return aComplete - bComplete
  }),
)

function timeAgo(ms: number): string {
  const diff = Date.now() - ms
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (minutes < 60) return 'Today'
  if (hours < 24) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (weeks < 4) return `${weeks}w ago`
  if (months < 12) return `${months}mo ago`

  const remainingMonths = months - years * 12
  return remainingMonths > 0 ? `${years}y ${remainingMonths}mo ago` : `${years}y ago`
}

function timeHint(sectionId: string): string {
  const ts = store.completedAt[sectionId]
  if (!ts) return 'Not started'
  return timeAgo(ts)
}
</script>

<template>
  <VContainer>
    <div>
      <div class="text-center">
        <h1
          v-motion
          :initial="{ opacity: 0, y: -16 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }"
          class="text-h3 my-0 font-condensed font-weight-regular"
          style="opacity: 0"
        >
          How do you
          <em
            v-motion
            :initial="{ opacity: 0, scale: 0.85 }"
            :enter="{
              opacity: 1,
              scale: 1,
              transition: { type: 'spring', stiffness: 440, damping: 22, delay: 60 },
            }"
            class="font-italic text-primary"
            style="display: inline-block; opacity: 0"
            >actually</em
          >
          live?
        </h1>
        <p
          v-motion
          :initial="{ opacity: 0, y: 8 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 100 },
          }"
          class="text-body-1 font-italic text-medium-emphasis mt-0 mb-6"
          style="opacity: 0"
        >
          Not how you mean to. How you actually do.
        </p>
      </div>

      <VRow>
        <VCol v-for="(section, index) in sortedSections" :key="section.id" cols="12" sm="4">
          <VCard
            v-motion
            :initial="{ opacity: 0, y: 32, scale: 0.97 }"
            :enter="{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: 'spring', stiffness: 260, damping: 22, delay: 60 + index * 50 },
            }"
            :hovered="{ scale: 1.025, transition: { duration: 200 } }"
            :tapped="{ scale: 0.97, transition: { duration: 100 } }"
            variant="flat"
            :subtitle="timeHint(section.id)"
            elevation="0"
            class="d-flex flex-column"
            color="tertiary-container"
          >
            <template #prepend>
              <VIcon size="48" :icon="section.icon" color="tertiary" />
            </template>
            <template #title>
              {{ section.label }}
            </template>
            <VCardText>{{ section.description }}</VCardText>
            <VCardActions>
              <VBtn
                :hovered="{ scale: 1.03, transition: { duration: 150 } }"
                :tapped="{ scale: 0.95, transition: { duration: 80 } }"
                :to="`/assessment/${section.id}`"
                variant="flat"
                block
                rounded="lg"
                color="tertiary"
                :append-icon="store.isCompleted(section.id) ? 'mdi-refresh' : 'mdi-arrow-right'"
              >
                {{ store.isCompleted(section.id) ? 'Retake' : 'Start' }}
              </VBtn>
            </VCardActions>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </VContainer>
</template>
