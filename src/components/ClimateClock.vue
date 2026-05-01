<script setup lang="ts">
import { useClimateClock } from '@/composables/useClimateClock'

const { loading, deadlineLabel, cd, currentLifeline, lifelineDisplay, lifelineIndex } =
  useClimateClock()
</script>

<template>
  <v-row no-gutters>

    <!-- DEADLINE -->
    <v-col cols="12" md="6">
      <v-sheet color="error">

        <v-sheet color="error-container" class="d-flex align-center">
          <v-chip
            v-if="$vuetify.display.mdAndUp"
            rounded="0" color="error" variant="flat" label
            class="text-mono font-weight-black"
          >DEADLINE</v-chip>

          <v-skeleton-loader
            v-if="loading"
            type="text" color="error-container" width="335" min-height="24"
            class="ml-2 clock-label-skeleton"
          />
          <span
            v-else
            v-motion
            :initial="{ opacity: 0, x: -10 }"
            :enter="{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } }"
            class="ml-2 text-uppercase font-weight-bold text-title-medium"
          >
            {{ deadlineLabel }}
          </span>
        </v-sheet>

        <v-skeleton-loader
          v-if="loading"
          type="text" color="error" width="315" min-height="40"
          class="pl-3"
        />
        <div v-else class="pl-3">
          <span
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 60 } }"
            class="text-headline-large text-mono"
          >{{ cd.years }}</span>
          <span
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { duration: 200, delay: 80 } }"
            class="text-headline-small"
          >&nbsp;yrs&nbsp;&nbsp;</span>

          <span
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 140 } }"
            class="text-headline-large text-mono"
          >{{ cd.days }}</span>
          <span
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { duration: 200, delay: 160 } }"
            class="text-headline-small"
          >&nbsp;days&nbsp;&nbsp;</span>

          <span
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 220 } }"
            class="text-headline-medium text-mono"
          >{{ cd.hours }}</span>
          <span class="text-headline-small">:</span>
          <span
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 300 } }"
            class="text-headline-medium text-mono"
          >{{ cd.mins }}</span>
          <span class="text-headline-small">:</span>
          <span
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 380 } }"
            class="text-headline-medium text-mono"
          >{{ cd.secs }}</span>
        </div>

      </v-sheet>
    </v-col>

    <!-- LIFELINE -->
    <v-col cols="12" md="6">
      <v-sheet color="tertiary">

        <v-sheet color="tertiary-container" class="d-flex align-center">
          <v-chip
            v-if="$vuetify.display.mdAndUp"
            rounded="0" color="tertiary" variant="flat" label
            class="text-mono font-weight-black"
          >LIFELINE</v-chip>

          <v-skeleton-loader
            v-if="loading"
            type="text" color="tertiary-container" width="335" min-height="24"
            class="ml-2 clock-label-skeleton"
          />
          <Transition v-else name="fade" mode="out-in">
            <span
              :key="lifelineIndex"
              v-motion
              :initial="{ opacity: 0, x: -10 }"
              :enter="{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } }"
              class="ml-2 text-uppercase font-weight-bold text-title-medium"
            >
              {{ currentLifeline?.label }}
            </span>
          </Transition>
        </v-sheet>

        <v-skeleton-loader
          v-if="loading"
          type="text" color="tertiary" width="315" min-height="40"
          class="pl-3"
        />
        <div v-else class="pl-3">
          <Transition name="fade" mode="out-in">
            <span :key="lifelineIndex" class="d-block">
              <span
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 100 } }"
                class="text-headline-large text-mono"
              >{{ lifelineDisplay }}</span>
              <span
                v-motion
                :initial="{ opacity: 0 }"
                :enter="{ opacity: 1, transition: { duration: 200, delay: 200 } }"
                class="text-headline-small"
              >&nbsp;{{ currentLifeline?.unit }}</span>
            </span>
          </Transition>
        </div>

      </v-sheet>
    </v-col>

  </v-row>
</template>

<style scoped>
:deep(.v-skeleton-loader__bone) {
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
