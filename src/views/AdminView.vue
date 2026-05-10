<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { VPie } from "vuetify/labs/VPie";
import { useProfileStore } from "@/stores/profile";
import { supabase } from "@/lib/supabaseClient";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminAnalytics {
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

// ── App bar — mirrors AppBarDocs exactly ─────────────────────────────────────

const router = useRouter();
const profileStore = useProfileStore();

const cameFromApp = !!window.history.state?.back;

function goBack() {
  router.push(cameFromApp ? { path: "/profile" } : { path: "/" });
}

// ── Data ─────────────────────────────────────────────────────────────────────

const analytics = ref<AdminAnalytics | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  const { data, error: rpcError } = await supabase.rpc("get_admin_analytics");
  if (rpcError) {
    error.value = rpcError.message;
  } else {
    analytics.value = data as AdminAnalytics;
  }
  loading.value = false;
});

// ── Band distribution — VPie ──────────────────────────────────────────────────
// Colors use rgb(var(--v-theme-X)) so they resolve from the active theme at
// render time. VPieSegment sets style.color = props.color and the SVG path
// uses fill:currentColor — so CSS custom property strings are the right hook.

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

// ── Section averages — VSparkline ─────────────────────────────────────────────

const SECTION_ABBREV: Record<string, string> = {
  transport: "Trans.",
  food: "Food",
  energy: "Energy",
  consumption: "Consum.",
  waste: "Waste",
  water: "Water",
  digital: "Digital",
};

const SECTION_CONFIG: Record<string, { label: string; icon: string }> = {
  transport: { label: "Transport", icon: "mdi-bus-multiple" },
  food: { label: "Food", icon: "mdi-food-apple-outline" },
  energy: { label: "Energy", icon: "mdi-lightning-bolt-outline" },
  consumption: { label: "Consumption", icon: "mdi-shopping-outline" },
  waste: { label: "Waste", icon: "mdi-trash-can-outline" },
  water: { label: "Water", icon: "mdi-waves" },
  digital: { label: "Digital", icon: "mdi-monitor-cellphone" },
};

const sparklineValues = computed(() =>
  (analytics.value?.section_averages ?? []).map((s) => s.avg_pct),
);

const sparklineLabels = computed(() =>
  (analytics.value?.section_averages ?? []).map(
    (s) => SECTION_ABBREV[s.section_id] ?? s.section_id,
  ),
);

function sectionColor(pct: number): string {
  if (pct >= 66) return "success";
  if (pct >= 51) return "warning";
  return "error";
}

// ── Habit adoption ────────────────────────────────────────────────────────────

const maxHabitTotal = computed(() =>
  Math.max(...(analytics.value?.habit_adoption.map((h) => h.total) ?? [1]), 1),
);

// ── Gender ────────────────────────────────────────────────────────────────────

const totalGender = computed(
  () => analytics.value?.gender_breakdown.reduce((s, g) => s + g.count, 0) ?? 0,
);
</script>

<template>
  <!-- ── App bar — identical pattern to AppBarDocs ─────────────────────────── -->
  <v-app-bar color="primary" flat class="border border-b">
    <template #prepend>
      <v-btn :icon="cameFromApp ? 'mdi-account-outline' : 'mdi-home-outline'" @click="goBack" />
    </template>
    <v-app-bar-title>
      <span class="font-condensed">Admin</span>
    </v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-container class="pt-4">
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
            <v-card rounded="xl" border flat class="mb-4">
              <v-list-item
                prepend-icon="mdi-shield-account-outline"
                :title="profileStore.profile?.name || 'Admin'"
                :subtitle="profileStore.userEmail || ''"
              >
                <template #append>
                  <v-chip color="primary" size="small" variant="tonal">Admin</v-chip>
                </template>
              </v-list-item>
            </v-card>

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

            <template v-else-if="analytics">
              <!-- ── 1. Totals ─────────────────────────────────────────── -->
              <div class="text-overline text-medium-emphasis px-1 mb-1">Overview</div>
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

              <!-- ── 2. Band distribution — VPie donut ─────────────────── -->
              <div class="text-overline text-medium-emphasis px-1 mb-1">Eco band distribution</div>
              <v-card rounded="xl" border flat class="mb-4">
                <v-card-text class="pa-4">
                  <div class="d-flex justify-center">
                    <VPie
                      :items="bandPieItems"
                      item-title="title"
                      item-value="value"
                      :size="200"
                      :gap="2"
                      :hover-scale="1"
                      :legend="false"
                      :tooltip="false"
                    />
                  </div>

                  <!-- Legend table -->
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

              <!-- ── 3. Section averages — VSparkline bar ───────────────── -->
              <div class="text-overline text-medium-emphasis px-1 mb-1">Section averages</div>
              <v-card rounded="xl" border flat class="mb-4">
                <v-card-text class="pa-4 pb-0">
                  <v-sparkline
                    type="bar"
                    :model-value="sparklineValues"
                    :labels="sparklineLabels"
                    :max="100"
                    :min="0"
                    color="rgb(var(--v-theme-primary))"
                    :height="90"
                    :padding="8"
                    show-labels
                    auto-line-width
                  />
                </v-card-text>

                <!-- Per-section chips below the chart -->
                <v-divider />
                <v-list lines="one" density="compact">
                  <template
                    v-for="(section, i) in analytics.section_averages"
                    :key="section.section_id"
                  >
                    <v-divider v-if="i > 0" />
                    <v-list-item
                      :prepend-icon="SECTION_CONFIG[section.section_id]?.icon"
                      :title="SECTION_CONFIG[section.section_id]?.label ?? section.section_id"
                    >
                      <template #append>
                        <div class="d-flex align-center gap-2">
                          <v-chip
                            :color="sectionColor(section.avg_pct)"
                            size="x-small"
                            variant="tonal"
                          >
                            {{ section.avg_pct }}%
                          </v-chip>
                          <span class="text-caption text-medium-emphasis">
                            {{ section.completion_count }} resp.
                          </span>
                        </div>
                      </template>
                    </v-list-item>
                  </template>
                </v-list>
              </v-card>

              <!-- ── 4. Habit states ───────────────────────────────────── -->
              <div class="text-overline text-medium-emphasis px-1 mb-1">Habit states</div>
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

              <!-- ── 5. Habit adoption ─────────────────────────────────── -->
              <div class="text-overline text-medium-emphasis px-1 mb-1">Top habits</div>
              <v-card rounded="xl" border flat class="mb-4">
                <v-list lines="two">
                  <template v-for="(habit, i) in analytics.habit_adoption" :key="habit.template_id">
                    <v-divider v-if="i > 0" />
                    <v-list-item prepend-icon="mdi-leaf-circle-outline">
                      <template #title>
                        <span class="text-body-2">{{ habit.template_id }}</span>
                      </template>
                      <template #subtitle>
                        <v-progress-linear
                          :model-value="(habit.total / maxHabitTotal) * 100"
                          color="primary"
                          bg-color="surface-variant"
                          rounded
                          height="5"
                          class="mt-1 mb-1"
                        />
                        <span class="text-caption text-medium-emphasis">
                          {{ habit.active }} active · {{ habit.paused }} paused ·
                          {{ habit.mastered }} mastered
                        </span>
                      </template>
                      <template #append>
                        <span class="text-body-2 font-weight-medium">{{ habit.total }}</span>
                      </template>
                    </v-list-item>
                  </template>
                  <v-list-item
                    v-if="!analytics.habit_adoption.length"
                    title="No habits adopted yet"
                    prepend-icon="mdi-information-outline"
                    subtitle="Data will appear once users start tracking habits"
                    disabled
                  />
                </v-list>
              </v-card>

              <!-- ── 6. Gender breakdown ───────────────────────────────── -->
              <div class="text-overline text-medium-emphasis px-1 mb-1">Gender breakdown</div>
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
