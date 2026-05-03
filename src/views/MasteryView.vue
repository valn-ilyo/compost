<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMasteryStore } from "@/stores/mastery";

const route = useRoute();
const router = useRouter();
import { useNotifier } from "@/composables/useNotifier";
import { HABIT_TEMPLATES } from "@/data/habits";
import { useAssessmentStore } from "@/stores/assessment";
import { getInsightsForAssessment } from "@/data/insights";
import HabitCard from "@/components/HabitCard.vue";
import HabitLibrary from "@/components/HabitLibrary.vue";
import MasteryCheckinSheet from "@/components/MasteryCheckInSheet.vue";
import MasterySwapSheet from "@/components/MasterySwapSheet.vue";
import MasteryFreezeInfo from "@/components/MasteryFreezeInfo.vue";
import type { HabitTemplate, UserHabit } from "@/types/app.types";
import { SECTIONS } from "@/data";

const store = useMasteryStore();
const { notify } = useNotifier();

// ── Recommendations (from insights) ──────────────────────────────────────────
const assessmentStore = useAssessmentStore();
const isAssessmentComplete = computed(() =>
  SECTIONS.every((s) => assessmentStore.sectionResults.some((r) => r.meta.id === s.id)),
);
const recommendedIds = computed(() => {
  if (!isAssessmentComplete.value) return []
  const insights = getInsightsForAssessment(assessmentStore.answers)
  // Exclude active and paused habits DURING matching so they don't consume a slot.
  // Filtering after-the-fact (old behaviour) meant a habit the user had already
  // added would silently burn one of the 3 recommendation positions, and a better
  // candidate further down the list would never surface.
  const seen = new Set<string>()
  const matched: string[] = []
  for (const i of insights.filter((i) => !i.isAffirmation)) {
    if (matched.length >= 3) break
    const h = HABIT_TEMPLATES.find(
      (h) =>
        h.covers.some((c) => c.sectionId === i.sectionId && c.questionId === i.questionId) &&
        !seen.has(h.id) &&
        !store.activeTemplateIds.has(h.id) &&
        !store.pausedTemplateIds.has(h.id),
    )
    if (h) {
      seen.add(h.id)
      matched.push(h.id)
    }
  }
  return matched
})

const checkinOpen = ref(false);
const swapOpen = ref(false);
const pendingTemplate = ref<HabitTemplate | null>(null);
const checkinHabitId = ref<string | undefined>(undefined);

const lostStreakMap = computed(
  () =>
    new Map(
      store.lastReconcileEvents.filter((e) => e.type === "lost").map((e) => [e.habitId, e.streak]),
    ),
);

const isLogAll = ref(false);
const frozenHabits = ref<Map<string, UserHabit>>(new Map());
const frozenLostStreakMap = ref<Map<string, number>>(new Map());
const frozenLogLabel = ref<string | null>(null);
const frozenFreezeCount = ref(0);
const frozenFreezeCap = ref(0);
const frozenDaysToNextFreeze = ref<number | null>(null);
const frozenAnyFreezeUsed = ref(false);

function resolveLogLabel(unlogged: number, total: number): string {
  if (unlogged === total) return "Log your habits";
  if (unlogged === 1) return "One left";
  return `Two left to log`;
}

function snapshotHabits(): void {
  frozenHabits.value = new Map(store.activeHabits.map((h) => [h.id, { ...h }]));
  frozenLostStreakMap.value = new Map(
    store.lastReconcileEvents.filter((e) => e.type === "lost").map((e) => [e.habitId, e.streak]),
  );
  frozenLogLabel.value = resolveLogLabel(store.unloggedToday.length, store.activeHabits.length);
  frozenFreezeCount.value = store.freezeCount;
  frozenFreezeCap.value = store.freezeCap;
  frozenDaysToNextFreeze.value = store.daysToNextFreeze;
  frozenAnyFreezeUsed.value = store.activeHabits.some((h) => h.freezeUsed);
}

function displayHabit(habit: UserHabit): UserHabit {
  return isLogAll.value && checkinOpen.value ? (frozenHabits.value.get(habit.id) ?? habit) : habit;
}

function displayLostStreak(habitId: string): number | undefined {
  return isLogAll.value && checkinOpen.value
    ? frozenLostStreakMap.value.get(habitId)
    : lostStreakMap.value.get(habitId);
}

const showAllLogged = computed(() => store.allLoggedToday && !checkinOpen.value);

const logLabel = computed(() => {
  if (isLogAll.value && checkinOpen.value && frozenLogLabel.value !== null)
    return frozenLogLabel.value;
  return resolveLogLabel(store.unloggedToday.length, store.activeHabits.length);
});

const displayFreezeCount = computed(() =>
  isLogAll.value && checkinOpen.value ? frozenFreezeCount.value : store.freezeCount,
);
const displayFreezeCap = computed(() =>
  isLogAll.value && checkinOpen.value ? frozenFreezeCap.value : store.freezeCap,
);
const displayDaysToNextFreeze = computed(() =>
  isLogAll.value && checkinOpen.value ? frozenDaysToNextFreeze.value : store.daysToNextFreeze,
);
const displayAnyFreezeUsed = computed(() =>
  isLogAll.value && checkinOpen.value
    ? frozenAnyFreezeUsed.value
    : store.activeHabits.some((h) => h.freezeUsed),
);

function handleLog(habitId: string): void {
  isLogAll.value = false;
  checkinHabitId.value = habitId;
  checkinOpen.value = true;
}

function handleLogAll(): void {
  isLogAll.value = true;
  snapshotHabits();
  checkinHabitId.value = undefined;
  checkinOpen.value = true;
}

function handleAdd(templateId: string): void {
  const template = HABIT_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return;
  if (store.activeHabits.length >= 3) {
    pendingTemplate.value = template;
    swapOpen.value = true;
  } else {
    store.addHabit(template);
  }
}

function handleResume(habitId: string): void {
  const habit = store.pausedHabits.find((h) => h.id === habitId);
  if (!habit) return;
  if (store.activeHabits.length >= 3) {
    const template = HABIT_TEMPLATES.find((t) => t.id === habit.templateId);
    if (!template) return;
    pendingTemplate.value = template;
    swapOpen.value = true;
  } else {
    store.resumeHabit(habitId);
    notify({ message: `"${habit.name}" is back. Streak restored.`, color: "info" });
  }
}

function handlePause(id: string): void {
  const habit = store.activeHabits.find((h) => h.id === id);
  if (!habit) return;
  store.pauseHabit(id);
  if (habit.streak > 0) {
    notify({ message: `"${habit.name}" paused. Streak saved.`, color: "info" });
  }
}

function handleRemove(id: string): void {
  const habit = store.activeHabits.find((h) => h.id === id);
  if (!habit) return;
  store.removeHabit(id);
}

function handleSwap(removeId: string): void {
  if (!pendingTemplate.value) return;
  const removed = store.activeHabits.find((h) => h.id === removeId);
  store.swapHabit(removeId, pendingTemplate.value);
  if (removed && removed.streak > 0) {
    notify({ message: `"${removed.name}" streak saved.`, color: "info" });
  }
  pendingTemplate.value = null;
  swapOpen.value = false;
}

function handleCheckinDone(): void {
  // no-op: sheet closes and habit cards update to checked state visually
}

watch(
  () => store.allLoggedToday,
  (allDone) => {
    if (allDone) store.clearReconcileEvents();
  },
);

onMounted(() => {
  if (route.query.action === "log" && store.activeHabits.length > 0) {
    router.replace({ name: "mastery" });
    handleLogAll();
  }
});
</script>

<template>
  <v-container class="pt-0 overflow-hidden">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <!-- toolbar -->
        <div
          v-motion
          :initial="{ opacity: 0, y: -12 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } }"
        >
          <v-toolbar flat color="transparent">
            <v-toolbar-title class="d-flex align-center">
              Mastery
              <v-chip variant="text" color="secondary" class="font-weight-bold count-chip">
                <Transition name="count-swap" mode="out-in">
                  <span :key="store.activeHabits.length">{{ store.activeHabits.length }}</span>
                </Transition>
                <span>&nbsp;/ 3</span>
              </v-chip>
            </v-toolbar-title>
            <template #append>
              <div class="d-flex align-center">
                <MasteryFreezeInfo
                  class="mr-3"
                  :freeze-count="displayFreezeCount"
                  :freeze-cap="displayFreezeCap"
                  :days-to-next-freeze="displayDaysToNextFreeze"
                  :any-freeze-used="displayAnyFreezeUsed"
                />
              </div>
            </template>
          </v-toolbar>
        </div>

        <!-- empty state / habit list — cross-fade on switch -->
        <Transition name="mastery-section" mode="out-in">
          <!-- empty state -->
          <div v-if="store.activeHabits.length === 0" key="empty">
            <v-alert
              type="success"
              variant="text"
              icon="mdi-sprout"
              class="mb-4"
              title="No habits yet"
              text="Choose up to 3 from the library below."
            />
          </div>

          <!-- habit list -->
          <div v-else key="habits">
            <v-card variant="outlined" rounded="lg" class="mb-4 overflow-hidden">
              <!--
                TransitionGroup replaces the v-for + v-divider pattern.

                - tag="div" wraps items; v-list-item renders correctly inside.
                - name="habit" maps to .habit-{enter,leave,move} CSS classes below.
                - position: absolute on leave-active is the key that lets the
                  remaining items slide up (FLIP/move) while the leaving item
                  fades out, rather than the whole list jumping.
                - Dividers are replaced by a CSS border-top on every row except
                  the first, using the adjacent-sibling selector, so they
                  disappear naturally when a row leaves without needing index logic.
              -->
              <TransitionGroup name="habit" tag="div" class="habit-list">
                <div v-for="habit in store.activeHabits" :key="habit.id" class="habit-row">
                  <HabitCard
                    :habit="displayHabit(habit)"
                    :is-logged-today="store.isLoggedToday(displayHabit(habit))"
                    :lost-streak="displayLostStreak(habit.id)"
                    @log="handleLog"
                    @pause="handlePause"
                    @remove="handleRemove"
                  />
                </div>
              </TransitionGroup>
            </v-card>

            <!-- log all button -->
            <v-expand-transition>
              <div v-if="!showAllLogged">
                <v-btn
                  block
                  size="large"
                  color="primary"
                  rounded="lg"
                  variant="flat"
                  class="mb-6"
                  @click="handleLogAll"
                >
                  <Transition name="label-swap" mode="out-in">
                    <span :key="logLabel" class="label-text">{{ logLabel }}</span>
                  </Transition>
                </v-btn>
              </div>
            </v-expand-transition>
          </div>
        </Transition>

        <v-divider class="mb-6" />

        <!-- library -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 32 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 22,
              delay: store.activeHabits.length * 80 + 160,
            },
          }"
        >
          <HabitLibrary :recommended-ids="recommendedIds" @add="handleAdd" @resume="handleResume" />
        </div>
      </v-col>
    </v-row>
  </v-container>

  <MasteryCheckinSheet v-model="checkinOpen" :habit-id="checkinHabitId" @done="handleCheckinDone" />
  <MasterySwapSheet v-model="swapOpen" :pending-template="pendingTemplate" @swap="handleSwap" />
</template>

<style scoped>
/* ── empty ↔ habits cross-fade ── */

/*
  Enter: pure opacity — no y — so the TransitionGroup's own row animations
  provide all the spatial feel without compounding with an outer y shift.
  Leave: fade + slight upward drift so the departing section feels intentional.
*/
.mastery-section-enter-active {
  transition: opacity 180ms ease;
}
.mastery-section-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}
.mastery-section-enter-from {
  opacity: 0;
}
.mastery-section-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── count chip number swap ── */
.count-swap-enter-active,
.count-swap-leave-active {
  transition: opacity 120ms ease;
}
.count-swap-enter-from,
.count-swap-leave-to {
  opacity: 0;
}

/* ── log button label swap ── */
/*
  position: absolute on leave so the button width doesn't thrash while
  the outgoing label fades and the incoming one measures itself.
*/
.label-swap-enter-active,
.label-swap-leave-active {
  transition: opacity 110ms ease;
}
.label-swap-leave-active {
  position: absolute;
}
.label-swap-enter-from,
.label-swap-leave-to {
  opacity: 0;
}
.label-text {
  display: inline-block;
}

/* ── habit list container ── */
.habit-list {
  position: relative; /* needed for absolute-positioned leaving items */
}

/* CSS divider: every row after the first gets a top border */
.habit-row + .habit-row {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* ── TransitionGroup animation classes ── */

/* New item slides up and fades in */
.habit-enter-active {
  transition:
    opacity 300ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.habit-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

/* Removed item slides right and fades out.
   position: absolute is the magic — it takes the row out of flow so
   the siblings immediately start their MOVE transition upward. */
.habit-leave-active {
  transition:
    opacity 240ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 240ms cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
}
.habit-leave-to {
  opacity: 0;
  transform: translateX(32px);
}

/* Siblings bubble up smoothly while a row is leaving */
.habit-move {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* keep subtitle opacity consistent */
:deep(.v-list-item-subtitle) {
  opacity: 1 !important;
}
</style>
