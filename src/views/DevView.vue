<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMasteryStore } from "@/stores/mastery";
import { useSyncStore } from "@/stores/sync";
import { clock } from "@/stores/clock";

const store = useMasteryStore();
const syncStore = useSyncStore();
const router = useRouter();

const DEV_OFFSET_KEY = "__dev_day_offset";

// ─── Simulate new day ─────────────────────────────────────────────────────────

/** Cumulative ms offset applied to clock.now this session. */
const dayOffset = ref(Number(localStorage.getItem(DEV_OFFSET_KEY) ?? 0));

/** How many times simulate-new-day has been called this session (not persisted). */
const daysSimulated = ref(Math.round(dayOffset.value / 86_400_000));

function simulateNewDay(): void {
  dayOffset.value += 86_400_000;
  localStorage.setItem(DEV_OFFSET_KEY, String(dayOffset.value));
  clock.now = () => new Date(Date.now() + dayOffset.value);
  store.reconcileStreaks();
  daysSimulated.value++;
}

// ─── Per-habit editors ────────────────────────────────────────────────────────

function setStreak(id: string, val: string): void {
  const habit = store.slots.find((h) => h.id === id);
  if (habit) habit.streak = Math.max(0, parseInt(val) || 0);
}

function setFreezeUsed(id: string, val: boolean): void {
  const habit = store.slots.find((h) => h.id === id);
  if (habit) habit.freezeUsed = val;
}

// ─── Clear store ──────────────────────────────────────────────────────────────

function clearStore(): void {
  store.slots = [];
  store.freezeCount = 0;
  store.masteredArchive = [];
  syncStore.clearQueue();
  dayOffset.value = 0;
  daysSimulated.value = 0;
  localStorage.removeItem(DEV_OFFSET_KEY);
  clock.now = () => new Date();
}

// ─── AuthView preview ─────────────────────────────────────────────────────────

function previewAuthState(state: "loading" | "error"): void {
  router.push({ name: "auth", query: { preview: state } });
}
</script>

<template>
  <v-app-bar flat>
    <v-app-bar-title>
      Dev Controls
      <v-chip size="x-small" color="warning" variant="tonal" class="ml-2"> mastery store </v-chip>
    </v-app-bar-title>
  </v-app-bar>

  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <!-- ── AuthView preview ───────────────────────────────────────────────── -->
        <v-card rounded="lg" class="mb-4">
          <v-card-title class="text-body-1 pt-4">AuthView states</v-card-title>
          <v-card-text class="d-flex flex-column gap-2">
            <v-btn
              block
              variant="tonal"
              color="secondary"
              prepend-icon="mdi-loading"
              @click="previewAuthState('loading')"
            >
              Preview loading state
            </v-btn>
            <v-btn
              block
              variant="tonal"
              color="error"
              prepend-icon="mdi-alert-circle-outline"
              @click="previewAuthState('error')"
            >
              Preview error state
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- ── Simulate new day ──────────────────────────────────────────────── -->
        <v-card rounded="lg" class="mb-4">
          <v-card-title class="text-body-1 pt-4">Time</v-card-title>
          <v-card-text>
            <v-btn
              block
              variant="tonal"
              color="primary"
              prepend-icon="mdi-weather-sunset-up"
              @click="simulateNewDay"
            >
              Simulate new day
            </v-btn>
            <p class="text-body-2 text-medium-emphasis mt-3 mb-0">
              Days simulated this session:
              <strong>{{ daysSimulated }}</strong>
            </p>
          </v-card-text>
        </v-card>

        <!-- ── Global freeze tokens ──────────────────────────────────────────── -->
        <v-card rounded="lg" class="mb-4">
          <v-card-title class="text-body-1 pt-4">Freeze tokens</v-card-title>
          <v-card-text>
            <v-row align="center" density="compact">
              <v-col>
                <span class="text-body-2">
                  {{ store.freezeCount }} / {{ store.freezeCap }} available
                </span>
              </v-col>
              <v-col cols="auto">
                <v-btn-group density="compact" variant="tonal">
                  <v-btn
                    icon="mdi-minus"
                    :disabled="store.freezeCount <= 0"
                    @click="store.freezeCount--"
                  />
                  <v-btn icon="mdi-plus" @click="store.freezeCount++" />
                </v-btn-group>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- ── Per-habit editors ─────────────────────────────────────────────── -->
        <template v-if="store.slots.length > 0">
          <v-card v-for="habit in store.slots" :key="habit.id" rounded="lg" class="mb-4">
            <v-list-item :title="habit.name" density="compact" class="pt-3">
              <template #append>
                <v-chip
                  size="x-small"
                  :color="habit.isPaused ? 'warning' : 'success'"
                  variant="tonal"
                >
                  {{ habit.isPaused ? "paused" : "active" }}
                </v-chip>
              </template>
            </v-list-item>

            <v-divider />

            <v-card-text>
              <v-row align="center">
                <v-col cols="6">
                  <v-text-field
                    label="Streak"
                    type="number"
                    density="compact"
                    variant="outlined"
                    hide-details
                    min="0"
                    :model-value="habit.streak"
                    @update:model-value="setStreak(habit.id, $event as string)"
                  />
                </v-col>
                <v-col cols="6">
                  <v-checkbox
                    label="Freeze used"
                    density="compact"
                    hide-details
                    :model-value="habit.freezeUsed"
                    @update:model-value="setFreezeUsed(habit.id, !!$event)"
                  />
                </v-col>
              </v-row>
              <p class="text-caption text-medium-emphasis mt-2 mb-0">
                Last logged: {{ habit.lastLoggedDate ?? "never" }}
              </p>
            </v-card-text>
          </v-card>
        </template>

        <v-alert
          v-else
          type="info"
          variant="tonal"
          icon="mdi-information-outline"
          class="mb-4"
          text="No habits in the store. Add some from the Mastery view first."
        />

        <!-- ── Clear store ───────────────────────────────────────────────────── -->
        <v-card rounded="lg">
          <v-card-title class="text-body-1 pt-4">Danger zone</v-card-title>
          <v-card-text>
            <v-btn
              block
              variant="tonal"
              color="error"
              prepend-icon="mdi-delete-sweep"
              @click="clearStore"
            >
              Clear entire store
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
