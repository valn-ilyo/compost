<!-- <script setup lang="ts">
// TODO [Phase 4] Restore admin analytics — depends on Supabase RPC (SECURITY DEFINER)
// This view is non-functional during Phase 2 and Phase 3 (no Supabase calls yet)
// The admin RPC query and all analytics rendering logic go here in Phase 4.

import { useRouter } from "vue-router"
const router = useRouter()
// TODO [Phase 4]: restore admin store/RPC calls, analytics state, chart data
</script>

<template>
  <v-app-bar color="primary" flat class="border border-b">
    <template #prepend>
      <v-btn
        :icon="cameFromApp ? 'mdi-account-arrow-left-outline' : 'mdi-home-outline'"
        @click="goBack"
      />
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
            ── Identity card ───────────────────────────────────────────
            <v-card flat class="mb-4 text-center">
              <v-list-item
                :title="profileStore.profile?.name || 'Admin'"
                :subtitle="profileStore.userEmail || ''"
              />
            </v-card>

            ── Filters ────────────────────────────────────────────────
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

            ── Loading ─────────────────────────────────────────────────
            <template v-if="loading">
              <v-skeleton-loader type="card" class="mb-4 rounded-xl" />
              <v-skeleton-loader type="card" class="mb-4 rounded-xl" />
              <v-skeleton-loader type="card" class="rounded-xl" />
            </template>

            ── Error ───────────────────────────────────────────────────
            <v-alert v-else-if="error" type="error" rounded="xl" class="mb-4">
              {{ error }}
            </v-alert>

            ── Empty state ─────────────────────────────────────────────
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
              ── 1. Totals ───────────────────────────────────────────
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

              ── 2. Band distribution — VPie ─────────────────────────
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
                        <td style="padding-right: 0">
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

              ── 3. Section averages ─────────────────────────────────
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
                      <td style="padding-right: 0">
                        <v-icon
                          :icon="SECTION_CONFIG[section.section_id]?.icon"
                          size="18"
                          color="medium-emphasis"
                        />
                      </td>
                      <td class="text-body-2" style="white-space: nowrap">
                        {{ SECTION_CONFIG[section.section_id]?.label ?? section.section_id }}
                      </td>
                      <td style="width: 100%">
                        <div class="d-flex align-center gap-4">
                          <v-progress-linear
                            :model-value="section.avg_pct"
                            :color="sectionColor(section.avg_pct)"
                            :bg-color="sectionColor(section.avg_pct)"
                            rounded
                            height="10"
                            class="flex-grow-1 mr-2"
                          />
                          <v-chip
                            :color="sectionColor(section.avg_pct)"
                            size="x-small"
                            variant="tonal"
                            style="justify-content: center"
                          >
                            {{ section.avg_pct }}%
                          </v-chip>
                        </div>
                      </td>
                      <td
                        class="text-body-2 text-medium-emphasis text-center"
                        style="white-space: nowrap"
                      >
                        {{ section.completion_count }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card>

              ── 4. Habit states ─────────────────────────────────────
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

              ── 5. Habit adoption ───────────────────────────────────────────
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
                    <span style="white-space: nowrap">{{
                      habitNameMap[item.template_id] ?? item.template_id
                    }}</span>
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

              ── 6. Gender breakdown ─────────────────────────────────
              <div class="text-overline text-medium-emphasis px-1 mt-2 mb-2">Gender breakdown</div>
              <v-card rounded="xl" border flat class="mb-6">
                <v-card-text class="pa-4">
                  <div
                    style="
                      display: grid;
                      grid-template-columns: max-content 1fr max-content;
                      /* bar cell now holds progress + chip via flex */
                      align-items: center;
                      gap: 0 12px;
                      row-gap: 12px;
                    "
                  >
                    <template v-for="g in genderBreakdown" :key="g.gender">
                      <span class="text-body-2">{{ g.gender }}</span>
                      <div class="d-flex align-center gap-4">
                        <v-progress-linear
                          :model-value="totalGender > 0 ? (g.count / totalGender) * 100 : 0"
                          :color="GENDER_COLORS[g.gender] ?? 'primary'"
                          :bg-color="GENDER_COLORS[g.gender] ?? 'primary'"
                          rounded
                          height="8"
                          class="flex-grow-1 mr-2"
                        />
                        <v-chip
                          :color="GENDER_COLORS[g.gender] ?? 'primary'"
                          size="x-small"
                          variant="tonal"
                          style="justify-content: center"
                        >
                          {{ totalGender > 0 ? Math.round((g.count / totalGender) * 100) : 0 }}%
                        </v-chip>
                      </div>
                      <span class="text-body-2 font-weight-medium">{{ g.count }}</span>
                    </template>
                  </div>
                </v-card-text>
              </v-card>
            </template>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template> -->
