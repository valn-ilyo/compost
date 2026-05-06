<script setup lang="ts">
import { computed, ref } from "vue";
import type { ComponentPublicInstance } from "vue";
import { useRouter } from "vue-router";
import { useAssessmentStore } from "@/stores/assessment";
import { useMasteryStore } from "@/stores/mastery";
import { usePwaInstall } from "@/composables/usePwaInstall";
import { SECTIONS } from "@/data";
import AppBarHome from "@/components/AppBarHome.vue";
import ClimateHeadlines from "@/components/ClimateHeadlines.vue";
import PwaInstallBanner from "@/components/PwaInstallBanner.vue";

const store = useAssessmentStore();
const masteryStore = useMasteryStore();
const router = useRouter();

const completedIds = computed(() => new Set(store.sectionResults.map((r) => r.meta.id)));
const hasStarted = computed(() => store.sectionResults.length > 0);
const nextSection = computed(() => SECTIONS.find((s) => !completedIds.value.has(s.id)));

const showLogButton = computed(
  () => masteryStore.activeHabits.length > 0 && !masteryStore.allLoggedToday,
);

const showAllDoneCard = computed(
  () => masteryStore.activeHabits.length > 0 && masteryStore.allLoggedToday,
);

function goToLog(): void {
  router.push({ name: "mastery", query: { action: "log" } });
}

const { isIos, installPrompt, showInstallBanner, triggerInstall } = usePwaInstall();

const cardWidth = ref<number>(0);

function measureCard(el: Element | ComponentPublicInstance | null) {
  if (el && "$el" in el) {
    cardWidth.value = (el.$el as HTMLElement).getBoundingClientRect().width;
  }
}
</script>

<template>
  <AppBarHome />
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" class="d-flex flex-column ga-3">
        <ClimateHeadlines />

        <template v-if="nextSection">
          <v-tooltip
            :text="nextSection.description"
            location="bottom"
            :content-props="{ style: `max-width: ${cardWidth}px; white-space: normal;` }"
          >
            <template #activator="{ props: tooltipProps }">
              <v-card
                v-bind="tooltipProps"
                :ref="measureCard"
                v-motion
                :initial="{ opacity: 0, y: 28, scale: 0.96 }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 300, damping: 22 },
                }"
                :to="`/assessment/${nextSection.id}`"
                color="tertiary-container"
                variant="flat"
                rounded
                :prepend-icon="nextSection.icon"
                append-icon="mdi-chevron-double-right"
              >
                <template #title>
                  <div>
                    <div class="text-label-small text-uppercase">
                      {{ hasStarted ? "Continue your assessment" : "Start your assessment" }}
                    </div>
                    <div class="text-title-large mb-1">
                      {{ nextSection.label }}
                    </div>
                  </div>
                </template>
              </v-card>
            </template>
          </v-tooltip>
        </template>

        <v-card
          v-if="showLogButton"
          v-motion
          :initial="{ opacity: 0, y: 28, scale: 0.96 }"
          :enter="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 80 },
          }"
          color="primary-container"
          variant="flat"
          rounded
          prepend-icon="mdi-leaf"
          append-icon="mdi-chevron-double-right"
          @click="goToLog"
        >
          <template #title>
            <div class="text-title-large mb-1">Log your habits</div>
          </template>
        </v-card>

        <v-card
          v-if="showAllDoneCard"
          v-motion
          :initial="{ opacity: 0, y: 28, scale: 0.96 }"
          :enter="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 80 },
          }"
          color="primary-container"
          variant="flat"
          rounded
          prepend-icon="mdi-check-decagram"
        >
          <template #title>
            <div class="text-title-large mb-1">All logged for today</div>
          </template>
        </v-card>

        <PwaInstallBanner
          :show="showInstallBanner"
          :has-install-prompt="!!installPrompt"
          :is-ios="isIos"
          @install="triggerInstall"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
