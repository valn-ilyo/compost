<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMasteryStore } from "@/stores/mastery";
import { useMasteryRecommendations } from "@/composables/useMasteryRecommendations";
import { useMasteryCheckin } from "@/composables/useMasteryCheckin";
import { useMasteryActions } from "@/composables/useMasteryActions";
import HabitCard from "@/components/HabitCard.vue";
import HabitLibrary from "@/components/HabitLibrary.vue";
import MasteryCheckinSheet from "@/components/MasteryCheckInSheet.vue";
import MasterySwapSheet from "@/components/MasterySwapSheet.vue";
import MasteryFreezeInfo from "@/components/MasteryFreezeInfo.vue";

const route = useRoute();
const router = useRouter();

const store = useMasteryStore();
const { recommendedIds } = useMasteryRecommendations();
const {
  checkinOpen,
  checkinHabitId,
  showAllLogged,
  logLabel,
  displayFreezeCount,
  displayFreezeCap,
  displayDaysToNextFreeze,
  displayDaysToNextMastery,
  displayAnyFreezeUsed,
  displayMasteredToday,
  displayHabit,
  displayLostStreak,
  handleLog,
  handleLogAll,
  handleCheckinDone,
} = useMasteryCheckin();
const {
  swapOpen,
  pendingTemplate,
  handleAdd,
  handleResume,
  handlePause,
  handleRemove,
  handleSwap,
  handleRetire,
} = useMasteryActions();

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
                  <span :key="store.usedSlots">{{ store.usedSlots }}</span>
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
                  :days-to-next-mastery="displayDaysToNextMastery"
                  :any-freeze-used="displayAnyFreezeUsed"
                  :mastered-today="displayMasteredToday"
                />
              </div>
            </template>
          </v-toolbar>
        </div>

        <!-- empty state / habit list — cross-fade on switch -->
        <Transition name="mastery-section" mode="out-in">
          <!-- empty state -->
          <div
            v-if="store.activeHabits.length === 0 && store.masteredHabits.length === 0"
            key="empty"
          >
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
              <TransitionGroup name="habit" tag="div" class="habit-list">
                <!-- Mastered habits render above active. Clicking fires retire. -->
                <div v-for="habit in store.masteredHabits" :key="habit.id" class="habit-row">
                  <HabitCard
                    :habit="habit"
                    :is-logged-today="false"
                    @retire="handleRetire"
                    @log="() => {}"
                    @pause="() => {}"
                    @remove="() => {}"
                  />
                </div>
                <div v-for="habit in store.activeHabits" :key="habit.id" class="habit-row">
                  <HabitCard
                    :habit="displayHabit(habit)"
                    :is-logged-today="store.isLoggedToday(displayHabit(habit))"
                    :lost-streak="displayLostStreak(habit.id)"
                    @log="handleLog"
                    @pause="handlePause"
                    @remove="handleRemove"
                    @retire="() => {}"
                  />
                </div>
              </TransitionGroup>
            </v-card>

            <!-- log all button — only shown when there are loggable active habits -->
            <v-expand-transition>
              <div v-if="!showAllLogged && store.activeHabits.length > 0">
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
  position: relative;
}

.habit-row + .habit-row {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* ── TransitionGroup animation classes ── */
.habit-enter-active {
  transition:
    opacity 300ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.habit-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

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

.habit-move {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-list-item-subtitle) {
  opacity: 1 !important;
}
</style>
