<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useTimeoutFn } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router";
import { useAssessmentStore } from "@/stores/assessment";
import type { SectionAnswers, QuestionId } from "@/types/app.types";
import { questionRegistry } from "@/data/index";
import { SECTIONS } from "../data/index";

const route = useRoute();
const router = useRouter();
const store = useAssessmentStore();

const sectionId = route.params.sectionId as string;
const questions = questionRegistry[sectionId] ?? [];
const meta = SECTIONS.find((s) => s.id === sectionId);

if (!meta || questions.length === 0) {
  router.replace("/assessment");
}

const step = ref(1);
const totalSteps = questions.length;
const isLastStep = computed(() => step.value === totalSteps);
const progress = computed(() => (step.value / totalSteps) * 100);

// Track navigation direction so the window slide feels intentional
const navDirection = ref<"forward" | "back">("forward");

const lastQuestionId = questions.at(-1)?.id;

const localAnswers = ref<Record<QuestionId, number | null>>(
  Object.fromEntries(questions.map((q) => [q.id, null])) as Record<QuestionId, number | null>,
);

const expandedPanel = ref<number | undefined>(undefined);
const lastAnswered = computed(
  () => lastQuestionId != null && localAnswers.value[lastQuestionId] !== null,
);
const submitting = ref(false);

const hintActive = ref(true);
const flashingOptionKey = ref<string | null>(null);

// useTimeoutFn auto-cancels on unmount — no manual clearTimeout or onUnmounted needed.
// stop() is idempotent; calling it after the timeout has already fired is safe.
const { stop } = useTimeoutFn(() => {
  hintActive.value = false;
}, 2000);

function stopHint(): void {
  hintActive.value = false;
  stop();
}

watch(expandedPanel, (val) => {
  if (val !== undefined) stopHint();
});

function goBack(): void {
  if (step.value === 1) {
    router.push("/assessment");
  } else {
    navDirection.value = "back";
    step.value--;
  }
}

function selectAndAdvance(questionId: QuestionId, points: number): void {
  localAnswers.value[questionId] = points;
  flashingOptionKey.value = `${questionId}-${points}`;
  if (!isLastStep.value) {
    navDirection.value = "forward";
    setTimeout(() => {
      flashingOptionKey.value = null;
      step.value++;
    }, 220);
  } else {
    setTimeout(() => {
      flashingOptionKey.value = null;
    }, 300);
  }
}

async function handleSubmit(): Promise<void> {
  if (!lastAnswered.value) return;
  submitting.value = true;
  const answers: SectionAnswers = Object.fromEntries(
    questions.map((q) => [q.id, localAnswers.value[q.id] as number]),
  );
  store.submitSection(sectionId, answers);
  await new Promise<void>((r) => setTimeout(r, 400));
  router.push({ path: "/assessment", query: { tab: "insights" } });
}
</script>

<template>
  <v-container class="py-0">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-toolbar flat color="surface" style="position: sticky; top: 0; z-index: 10">
          <v-btn icon variant="text" color="primary" @click="goBack">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-toolbar-title>{{ meta?.label }}</v-toolbar-title>
          <template #append>
                      <v-fade-transition v-if="isLastStep && lastAnswered">
              <div
                v-motion
                :initial="{ opacity: 0, scale: 0.5, y: -8 }"
                :enter="{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: { type: 'spring', stiffness: 520, damping: 18 },
                }"
              >
                <v-btn
                  color="primary"
                  variant="flat"
                  :loading="submitting"
                  @click="handleSubmit"
                  append-icon="mdi-check"
                  >Done</v-btn
                >
              </div>
            </v-fade-transition>
          </template>
          <template #extension>
            <v-progress-linear :model-value="progress" color="primary" rounded />
          </template>
        </v-toolbar>
                <v-window
          v-model="step"
          transition="slide-x-transition"
          reverse-transition="slide-x-reverse-transition"
          style="overflow: hidden"
        >
          <v-window-item
            v-for="(question, index) in questions"
            :key="question.id"
            :value="index + 1"
          >
                        <div :key="step" class="pt-2">
                            <v-expansion-panels
                v-motion
                :initial="{ opacity: 0, y: -24, rotateX: 8 }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  transition: { type: 'spring', stiffness: 280, damping: 22 },
                }"
                v-model="expandedPanel"
                variant="accordion"
                flat
                style="transform-origin: top center; perspective: 800px"
              >
                <v-expansion-panel>
                  <v-expansion-panel-title class="text-title-large">
                    {{ question.text }}
                    <template #actions="{ expanded }">
                      <v-icon
                        color="tertiary"
                        :icon="expanded ? 'mdi-lightbulb-on' : 'mdi-lightbulb-on-outline'"
                        :class="{ 'hint-pulse': hintActive }"
                      />
                    </template>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div
                      v-motion
                      :initial="{ opacity: 0, scale: 0.82, x: 12, y: -10 }"
                      :enter="{
                        opacity: 1,
                        scale: 1,
                        x: 0,
                        y: 0,
                        transition: { type: 'spring', stiffness: 300, damping: 22, delay: 60 },
                      }"
                      style="transform-origin: top right"
                    >
                      <v-alert
                        variant="tonal"
                        class="text-body-2"
                        rounded="xl"
                        color="tertiary"
                        style="border-top-right-radius: 0 !important"
                      >
                        {{ question.whyItMatters }}
                      </v-alert>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-list class="pa-0 mt-1">
                <v-hover
                  v-for="(option, i) in question.options"
                  :key="option.points"
                  v-slot="{ isHovering, props: hoverProps }"
                >
                  <v-list-item
                    v-bind="hoverProps"
                    v-motion
                    :initial="{
                      opacity: 0,
                      x: navDirection === 'forward' ? -28 : 28,
                      y: 10,
                      scale: 0.97,
                    }"
                    :enter="{
                      opacity: 1,
                      x: 0,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: 'spring',
                        stiffness: 300,
                        damping: 22,
                        delay: 80 + i * 70,
                      },
                    }"
                    :active="localAnswers[question.id] === option.points || !!isHovering"
                    color="primary"
                    rounded="sm"
                    :class="[
                      'border-s-md mb-2 border-opacity-50',
                      { 'option-flash': flashingOptionKey === `${question.id}-${option.points}` },
                    ]"
                    @click="selectAndAdvance(question.id, option.points)"
                  >
                    {{ option.label }}
                  </v-list-item>
                </v-hover>
              </v-list>
            </div>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
:deep(.v-expansion-panel-title__overlay) {
  opacity: 0 !important;
}

:deep(.v-window__container),
:deep(.v-window-item),
:deep(.v-list) {
  overflow: hidden !important;
}

/* Hint icon pulses to draw attention, then stops */
.hint-pulse {
  animation: hint-pulse 1s ease-in-out 3;
}

@keyframes hint-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.15;
  }
}

.option-flash {
  animation: option-flash 240ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes option-flash {
  0% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.035);
  }
  100% {
    transform: scale(1);
  }
}
</style>
