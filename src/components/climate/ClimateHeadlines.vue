<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRafFn } from "@vueuse/core";
import { useClimateClock } from "@/composables/useClimateClock";

const { loading, tickerItems } = useClimateClock();

const activeIndex = ref(0);
const progress = ref(0);

const INTERVAL = 5000;
let startTime: number | null = null;

// useRafFn cancels the loop automatically on unmount — no rafId or
// onBeforeUnmount needed.
const { pause, resume } = useRafFn(
  ({ timestamp }) => {
    if (startTime === null) startTime = timestamp;
    progress.value = Math.min(((timestamp - startTime) / INTERVAL) * 100, 100);
  },
  { immediate: false },
);

function resetProgress() {
  pause();
  startTime = null;
  progress.value = 0;
  resume();
}

watch(activeIndex, () => resetProgress());
onMounted(() => resetProgress());

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "short" })} '${d.getFullYear().toString().slice(2)}`;
}
</script>

<template>
  <v-sheet>
    <v-chip label variant="text" class="text-uppercase">
      Good news about the planet.
      <template #append>
        <v-progress-circular
          :model-value="progress"
          size="12"
          width="1.5"
          class="ml-2 headline-progress"
        />
      </template>
    </v-chip>

    <!-- Skeleton -->
    <v-card
      v-if="loading"
      color="tertiary-container"
      rounded="medium"
      elevation="0"
      :min-height="$vuetify.display.smAndUp ? 116 : 144"
      class="d-flex flex-column"
    >
      <v-card-title class="pb-0">
        <v-skeleton-loader type="text" color="tertiary-container" class="pt-2 pb-3" />
        <v-skeleton-loader
          type="text"
          color="tertiary-container"
          class="pb-3"
          v-if="!$vuetify.display.smAndUp"
        />
        <v-skeleton-loader type="text" color="tertiary-container" width="50%" />
      </v-card-title>
      <v-spacer />
      <v-card-actions class="py-0">
        <v-spacer />
        <v-skeleton-loader type="text" color="tertiary-container" width="160" height="24" />
        <v-skeleton-loader
          type="text"
          color="tertiary-container"
          width="48"
          height="24"
          class="ml-2"
        />
      </v-card-actions>
    </v-card>

    <!-- Carousel -->
    <div
      v-else
      v-motion
      :initial="{ opacity: 0, y: 16 }"
      :enter="{
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 22, delay: 60 },
      }"
    >
      <v-carousel
        v-model="activeIndex"
        cycle
        :interval="5000"
        :show-arrows="false"
        height="auto"
        hide-delimiters
      >
        <v-carousel-item v-for="(item, i) in tickerItems" :key="i" :value="i">
          <v-card
            color="tertiary-container"
            rounded="medium"
            elevation="0"
            class="d-flex flex-column"
            :min-height="$vuetify.display.smAndUp ? 116 : 144"
          >
            <v-card-title
              class="pb-0 text-wrap font-weight-medium newsfeed-headline"
              :class="$vuetify.display.smAndUp ? 'clamp-2' : 'clamp-3'"
            >
              {{ item.headline }}
            </v-card-title>
            <v-spacer />
            <v-card-actions class="py-0">
              <v-spacer />
              <v-btn
                :href="item.link"
                color="on-tertiary-container"
                target="_blank"
                rel="noopener noreferrer"
                variant="text"
                append-icon="mdi-open-in-new"
                class="pa-1"
                rounded="0"
                density="compact"
              >
                {{ item.source }}, {{ formatDate(item.date) }}
              </v-btn>
              <v-btn-group density="compact" size="x-small" variant="text" rounded="medium">
                <v-btn
                  color="on-tertiary-container"
                  icon="mdi-chevron-left"
                  @click="activeIndex = (activeIndex - 1 + tickerItems.length) % tickerItems.length"
                  :ripple="false"
                />
                <v-btn
                  color="on-tertiary-container"
                  icon="mdi-chevron-right"
                  @click="activeIndex = (activeIndex + 1) % tickerItems.length"
                  :ripple="false"
                />
              </v-btn-group>
            </v-card-actions>
          </v-card>
        </v-carousel-item>
      </v-carousel>
    </div>
  </v-sheet>
</template>

<style scoped>
.newsfeed-headline {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.clamp-2 {
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
.clamp-3 {
  -webkit-line-clamp: 3;
  line-clamp: 3;
}
:deep(.v-skeleton-loader__bone) {
  margin: 0;
}
:deep(.headline-progress .v-progress-circular__overlay) {
  transition: none;
}
</style>
