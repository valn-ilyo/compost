<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { VPie } from "vuetify/labs/VPie";
import { useProfileStore } from "@/stores/profile";
import { supabase } from "@/lib/supabaseClient";
import { HABIT_TEMPLATES } from "@/data/habits";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminAnalytics {
  available_years: number[];
  totals: {
    registered: number;
    assessment_started: number;
    assessment_complete: number;
    with_active_habits: number;
  };
  band_distribution: Array<{
    id: string;
    label: string;
    count: number;
    sort_order: number;
  }>;
  section_averages: Array<{
    section_id: string;
    scaled_max: number;
    avg_score: number;
    avg_pct: number;
    completion_count: number;
  }>;
  habit_states: {
    active: number;
    paused: number;
    mastered: number;
  };
  habit_adoption: Array<{
    template_id: string;
    total: number;
    active: number;
    paused: number;
    mastered: number;
  }>;
  gender_breakdown: Array<{
    gender: string;
    count: number;
  }>;
}

// ── App bar ───────────────────────────────────────────────────────────────────

const router = useRouter();
const profileStore = useProfileStore();

const cameFromApp = !!window.history.state?.back;

function goBack() {
  router.push(cameFromApp ? { path: "/profile" } : { path: "/" });
}

// ── Data & filters ────────────────────────────────────────────────────────────

const analytics = ref<AdminAnalytics | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const selectedYear = ref<number | null>(null);
const selectedGender = ref<string | null>(null);

// Stable gender list seeded on first unfiltered fetch — options never disappear when a
// batch has zero female (or other) candidates, which would look like a bug.
const baseGenders = ref<string[]>([]);

const yearItems = computed(() => [
  { title: "All", value: null },
  ...(analytics.value?.available_years ?? []).map((yr) => ({
    title: `Batch '${String(yr).padStart(2, "0")}`,
    value: yr,
  })),
]);

const genderItems = computed(() => [
  { title: "All", value: null },
  ...baseGenders.value.map((g) => ({ title: g, value: g })),
]);

// True when the current filter combination matches no users
const isEmpty = computed(() => !!analytics.value && analytics.value.totals.registered === 0);

async function fetchAnalytics() {
  loading.value = true;
  error.value = null;
  const { data, error: rpcError } = await supabase.rpc("get_admin_analytics", {
    p_year: selectedYear.value,
    p_gender: selectedGender.value,
  });
  if (rpcError) {
    error.value = rpcError.message;
  } else {
    analytics.value = data as AdminAnalytics;
    if (baseGenders.value.length === 0) {
      baseGenders.value = (data as AdminAnalytics).gender_breakdown
        .map((g) => g.gender)
        .filter((g) => g !== "Not specified");
    }
  }
  loading.value = false;
}

onMounted(fetchAnalytics);
watch([selectedYear, selectedGender], fetchAnalytics);

// ── Band distribution — VPie ──────────────────────────────────────────────────

const BAND_COLORS: Record<string, string> = {
  "starting-out": "rgb(var(--v-theme-error))",
  "becoming-aware": "rgb(var(--v-theme-warning))",
  "building-habits": "rgb(var(--v-theme-secondary))",
  "green-leader": "rgb(var(--v-theme-tertiary))",
  "eco-champion": "rgb(var(--v-theme-primary))",
  "sustainability-exemplar": "rgb(var(--v-theme-inverse-primary))",
};

const bandPieItems = computed(() =>
  (analytics.value?.band_distribution ?? []).map((b) => ({
    title: b.label,
    value: b.count,
    color: BAND_COLORS[b.id] ?? "rgb(var(--v-theme-outline))",
  })),
);

const totalAssessed = computed(
  () => analytics.value?.band_distribution.reduce((s, b) => s + b.count, 0) ?? 0,
);

function bandPct(count: number): string {
  if (!totalAssessed.value) return "—";
  return Math.round((count / totalAssessed.value) * 100) + "%";
}

// ── Section averages ──────────────────────────────────────────────────────────

const SECTION_CONFIG: Record<string, { label: string; icon: string }> = {
  transport: { label: "Transport", icon: "mdi-bus-multiple" },
  food: { label: "Food", icon: "mdi-food-apple-outline" },
  energy: { label: "Energy", icon: "mdi-lightning-bolt-outline" },
  consumption: { label: "Consumption", icon: "mdi-shopping-outline" },
  waste: { label: "Waste", icon: "mdi-trash-can-outline" },
  water: { label: "Water", icon: "mdi-waves" },
  digital: { label: "Digital", icon: "mdi-monitor-cellphone" },
};

function sectionColor(pct: number): string {
  if (pct >= 66) return "success";
  if (pct >= 51) return "warning";
  return "error";
}

// ── Habit adoption ────────────────────────────────────────────────────────────

const habitNameMap = Object.fromEntries(HABIT_TEMPLATES.map((h) => [h.id, h.name]));

// ── Gender ────────────────────────────────────────────────────────────────────

const totalGender = computed(
  () => analytics.value?.gender_breakdown.reduce((s, g) => s + g.count, 0) ?? 0,
);
</script>

<template>
  <!-- ── App bar ────────────────────────────────────────────────────────────── -->
  <v-app-bar color="primary" flat class="border border-b">
    <template #prepend>
      <v-btn :icon="cameFromApp ? 'mdi-account-outline' : 'mdi-home-outline'" @click="goBack" />
    </template>
    <v-app-bar-title>
      <span class="font-condensed">Admin</span>
    </v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-container class="pt-4" fluid>
      <v-row justify="center">
        <v-col cols="12" sm="10" md="8" lg="6" xl="4">
          <div
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { type: 'spring', stiffness: 260, damping: 22 },
            }"
          >
            <!-- ── Identity card ─────────────────────────────────────────── -->
            <v-card flat class="mb-4 text-center">
              <v-list-item
                :title="profileStore.profile?.name || 'Admin'"
                :subtitle="profileStore.userEmail || ''"
              />
            </v-card>

            <!-- ── Filters ──────────────────────────────────────────────── -->
            <div class="text-overline text-medium-emphasis px-1 mb-4">Filters</div>
            <v-row dense class="mb-4">
              <v-col cols="6">
                <v-select
                  v-model="selectedYear"
                  label="Batch year"
                  :items="yearItems"
                  density="compact"
                  rounded="xl"
                  variant="outlined"
                  hide-details
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="selectedGender"
                  label="Gender"
                  :items="genderItems"
                  density="compact"
                  rounded="xl"
                  variant="outlined"
                  hide-details
                  class="text-capitalize"
                />
              </v-col>
            </v-row>

            <!-- ── Loading ───────────────────────────────────────────────── -->
            <template v-if="loading">
              <v-skeleton-loader type="card" class="mb-4 rounded-xl" />
              <v-skeleton-loader type="card" class="mb-4 rounded-xl" />
              <v-skeleton-loader type="card" class="rounded-xl" />
            </template>

            <!-- ── Error ─────────────────────────────────────────────────── -->
            <v-alert v-else-if="error" type="error" rounded="xl" class="mb-4">
              {{ error }}
            </v-alert>

            <!-- ── Empty state ───────────────────────────────────────────── -->
            <v-card v-else-if="isEmpty" rounded="xl" border flat class="mb-4">
              <v-card-text class="text-center pa-8">
                <v-icon
                  icon="mdi-filter-off-outline"
                  size="40"
                  color="medium-emphasis"
                  class="mb-3"
                />
                <div class="text-body-1 font-weight-medium mb-1">
                  No users match this combination
                </div>
                <div class="text-body-2 text-medium-emphasis mb-4">
                  Try adjusting the batch year or gender filter.
                </div>
                <v-btn
                  variant="tonal"
                  size="small"
                  rounded="xl"
                  @click="
                    selectedYear = null;
                    selectedGender = null;
                  "
                >
                  Clear filters
                </v-btn>
              </v-card-text>
            </v-card>

            <template v-else-if="analytics">
              <!-- ── 1. Totals ─────────────────────────────────────────── -->
              <div class="text-overline text-medium-emphasis px-1 mt-2 mb-2">Overview</div>
              <v-row dense class="mb-4">
                <v-col cols="6">
                  <v-card rounded="xl" border flat>
                    <v-card-text class="text-center pa-4">
                      <div class="text-h4 font-weight-bold text-primary">
                        {{ analytics.totals.registered }}
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">Registered</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card rounded="xl" border flat>
                    <v-card-text class="text-center pa-4">
                      <div class="text-h4 font-weight-bold text-primary">
                        {{ analytics.totals.assessment_started }}
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">Assessed</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card rounded="xl" border flat>
                    <v-card-text class="text-center pa-4">
                      <div class="text-h4 font-weight-bold text-primary">
                        {{ analytics.totals.assessment_complete }}
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">Fully complete</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card rounded="xl" border flat>
                    <v-card-text class="text-center pa-4">
                      <div class="text-h4 font-weight-bold text-primary">
                        {{ analytics.totals.with_active_habits }}
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">Active habits</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- ── 2. Band distribution — VPie ───────────────────────── -->
              <div class="text-overline text-medium-emphasis px-1 mt-2 mb-2">
                Eco band distribution
              </div>
              <v-card rounded="xl" border flat class="mb-4">
                <v-card-text class="pa-4">
                  <div class="d-flex justify-center">
                    <VPie
                      :items="bandPieItems"
                      item-title="title"
                      item-value="value"
                      :size="200"
                      :gap="0"
                      :hover-scale="1"
                      :legend="false"
                      :tooltip="false"
                    />
                  </div>

                  <v-table density="compact" class="mt-3">
                    <tbody>
                      <tr v-for="band in analytics.band_distribution" :key="band.id">
                        <td style="width: 20px; padding-right: 0">
                          <div
                            class="rounded-circle"
                            style="width: 10px; height: 10px"
                            :style="{ backgroundColor: BAND_COLORS[band.id] }"
                          />
                        </td>
                        <td class="text-body-2">{{ band.label }}</td>
                        <td class="text-body-2 font-weight-medium text-right">{{ band.count }}</td>
                        <td class="text-caption text-medium-emphasis text-right">
                          {{ bandPct(band.count) }}
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>

              <!-- ── 3. Section averages ───────────────────────────────── -->
              <div class="text-overline text-medium-emphasis px-1 mt-2 mb-2">Section averages</div>
              <v-card rounded="xl" border flat class="mb-4">
                <v-table density="comfortable">
                  <thead>
                    <tr>
                      <th colspan="2" class="text-left text-caption text-medium-emphasis">
                        Section
                      </th>
                      <th class="text-left text-caption text-medium-emphasis">Avg. score</th>
                      <th
                        class="text-center text-caption text-medium-emphasis"
                        style="white-space: nowrap"
                      >
                        Responses
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="section in analytics.section_averages" :key="section.section_id">
                      <td style="width: 32px; padding-right: 0">
                        <v-icon
                          :icon="SECTION_CONFIG[section.section_id]?.icon"
                          size="18"
                          color="medium-emphasis"
                        />
                      </td>
                      <td class="text-body-2" style="width: 110px; white-space: nowrap">
                        {{ SECTION_CONFIG[section.section_id]?.label ?? section.section_id }}
                      </td>
                      <td>
                        <div class="d-flex align-center gap-2">
                          <v-progress-linear
                            :model-value="section.avg_pct"
                            :color="sectionColor(section.avg_pct)"
                            bg-color="surface-variant"
                            rounded
                            height="10"
                            class="flex-grow-1"
                          />
                          <v-chip
                            :color="sectionColor(section.avg_pct)"
                            size="x-small"
                            variant="tonal"
                            style="min-width: 44px; justify-content: center"
                          >
                            {{ section.avg_pct }}%
                          </v-chip>
                        </div>
                      </td>
                      <td
                        class="text-body-2 text-medium-emphasis text-center"
                        style="white-space: nowrap; width: 48px"
                      >
                        {{ section.completion_count }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card>

              <!-- ── 4. Habit states ───────────────────────────────────── -->
              <div class="text-overline text-medium-emphasis px-1 mt-2 mb-2">Habit states</div>
              <v-row dense class="mb-4">
                <v-col cols="4">
                  <v-card rounded="xl" border flat>
                    <v-card-text class="text-center pa-3">
                      <div class="text-h5 font-weight-bold text-primary">
                        {{ analytics.habit_states.active }}
                      </div>
                      <div class="text-caption text-medium-emphasis">Active</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="4">
                  <v-card rounded="xl" border flat>
                    <v-card-text class="text-center pa-3">
                      <div class="text-h5 font-weight-bold text-warning">
                        {{ analytics.habit_states.paused }}
                      </div>
                      <div class="text-caption text-medium-emphasis">Paused</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="4">
                  <v-card rounded="xl" border flat>
                    <v-card-text class="text-center pa-3">
                      <div class="text-h5 font-weight-bold text-secondary">
                        {{ analytics.habit_states.mastered }}
                      </div>
                      <div class="text-caption text-medium-emphasis">Mastered</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- ── 5. Habit adoption ─────────────────────────────────────────── -->
              <div class="text-overline text-medium-emphasis px-1 mt-2 mb-2">Habits</div>
              <v-card rounded="xl" border flat class="mb-4">
                <v-data-table
                  :headers="[
                    { title: 'Habit', key: 'template_id', sortable: true },
                    { title: 'Total', key: 'total', sortable: true, align: 'center' },
                    { title: 'Active', key: 'active', sortable: true, align: 'center' },
                    { title: 'Paused', key: 'paused', sortable: true, align: 'center' },
                    { title: 'Mastered', key: 'mastered', sortable: true, align: 'center' },
                  ]"
                  :items="analytics.habit_adoption"
                  :sort-by="[{ key: 'total', order: 'desc' }]"
                  density="compact"
                >
                  <template #[`item.template_id`]="{ item }">
                    <span>{{ habitNameMap[item.template_id] ?? item.template_id }}</span>
                  </template>
                  <template #[`item.active`]="{ item }">
                    <span class="text-primary font-weight-medium">{{ item.active }}</span>
                  </template>
                  <template #[`item.paused`]="{ item }">
                    <span class="text-warning font-weight-medium">{{ item.paused }}</span>
                  </template>
                  <template #[`item.mastered`]="{ item }">
                    <span class="text-secondary font-weight-medium">{{ item.mastered }}</span>
                  </template>
                </v-data-table>
              </v-card>

              <!-- ── 6. Gender breakdown ───────────────────────────────── -->
              <div class="text-overline text-medium-emphasis px-1 mt-2 mb-2">Gender breakdown</div>
              <v-card rounded="xl" border flat class="mb-6">
                <v-card-text class="pa-4">
                  <div class="d-flex flex-column gap-3">
                    <div
                      v-for="g in analytics.gender_breakdown"
                      :key="g.gender"
                      class="d-flex align-center gap-3"
                    >
                      <span class="text-body-2 text-capitalize" style="min-width: 80px">
                        {{ g.gender }}
                      </span>
                      <v-progress-linear
                        :model-value="totalGender > 0 ? (g.count / totalGender) * 100 : 0"
                        color="primary"
                        bg-color="surface-variant"
                        rounded
                        height="6"
                        class="flex-grow-1"
                      />
                      <span
                        class="text-body-2 font-weight-medium"
                        style="min-width: 28px; text-align: right"
                      >
                        {{ g.count }}
                      </span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </template>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
