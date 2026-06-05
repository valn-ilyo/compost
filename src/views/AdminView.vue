<!-- View -- admin analytics dashboard with year/gender filters and RPC-backed charts -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile.store'
import { supabase } from '@/services/supabase.service'
import { HABIT_TEMPLATES } from '@/data/habits'

interface AdminAnalytics {
  available_years: number[]
  totals: {
    registered: number
    assessment_started: number
    assessment_complete: number
    with_active_habits: number
  }
  band_distribution: Array<{
    id: string
    label: string
    count: number
    sort_order: number
  }>
  section_averages: Array<{
    section_id: string
    scaled_max: number
    avg_score: number
    avg_pct: number
    completion_count: number
  }>
  habit_states: {
    active: number
    paused: number
    mastered: number
  }
  habit_adoption: Array<{
    template_id: string
    total: number
    active: number
    paused: number
    mastered: number
  }>
  gender_breakdown: Array<{
    gender: string
    count: number
  }>
}

const router = useRouter()
const profileStore = useProfileStore()

const didComeFromApp = !!window.history.state?.back

function goBack() {
  router.push(didComeFromApp ? { path: '/profile' } : { path: '/' })
}

const analytics = ref<AdminAnalytics | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const selectedYear = ref<number | null>(null)
const selectedGender = ref<string | null>(null)

// Stable gender list seeded on first unfiltered fetch -- options never disappear when a
// batch has zero female (or other) candidates, which would look like a bug.
const baseGenders = ref<string[]>([])

const yearItems = computed(() => [
  { title: 'All', value: null },
  ...(analytics.value?.available_years ?? []).map((yr) => ({
    title: `Batch '${String(yr).padStart(2, '0')}`,
    value: yr,
  })),
])

const genderItems = computed(() => [
  { title: 'All', value: null },
  ...baseGenders.value.map((g) => ({ title: g, value: g })),
])

const isEmpty = computed(() => !!analytics.value && analytics.value.totals.registered === 0)

async function fetchAnalytics() {
  isLoading.value = true
  error.value = null
  const { data, error: rpcError } = await supabase.rpc('get_admin_analytics', {
    p_year: selectedYear.value,
    p_gender: selectedGender.value,
  })
  if (rpcError) {
    error.value = rpcError.message
  } else {
    analytics.value = data as AdminAnalytics
    if (baseGenders.value.length === 0) {
      baseGenders.value = (data as AdminAnalytics).gender_breakdown
        .map((g) => g.gender)
        .filter((g) => g !== 'Not specified')
    }
  }
  isLoading.value = false
}

onMounted(fetchAnalytics)
watch([selectedYear, selectedGender], fetchAnalytics)

const BAND_COLORS: Record<string, string> = {
  'starting-out': 'rgb(var(--v-theme-error))',
  'becoming-aware': 'rgb(var(--v-theme-warning))',
  'building-habits': 'rgb(var(--v-theme-secondary))',
  'green-leader': 'rgb(var(--v-theme-tertiary))',
  'eco-champion': 'rgb(var(--v-theme-primary))',
  'sustainability-exemplar': 'rgb(var(--v-theme-inverse-primary))',
}

const bandPieItems = computed(() =>
  (analytics.value?.band_distribution ?? []).map((b) => ({
    title: b.label,
    value: b.count,
    color: BAND_COLORS[b.id] ?? 'rgb(var(--v-theme-outline))',
  })),
)

const totalAssessed = computed(
  () => analytics.value?.band_distribution.reduce((s, b) => s + b.count, 0) ?? 0,
)

function bandPct(count: number): string {
  if (!totalAssessed.value) return '—'
  return Math.round((count / totalAssessed.value) * 100) + '%'
}

const SECTION_CONFIG: Record<string, { label: string; icon: string }> = {
  transport: { label: 'Transport', icon: 'mdi-bus-multiple' },
  food: { label: 'Food', icon: 'mdi-food-apple-outline' },
  energy: { label: 'Energy', icon: 'mdi-lightning-bolt-outline' },
  consumption: { label: 'Consumption', icon: 'mdi-shopping-outline' },
  waste: { label: 'Waste', icon: 'mdi-trash-can-outline' },
  water: { label: 'Water', icon: 'mdi-waves' },
  digital: { label: 'Digital', icon: 'mdi-monitor-cellphone' },
}

function sectionColor(pct: number): string {
  if (pct >= 66) return 'success'
  if (pct >= 51) return 'warning'
  return 'error'
}

const habitNameMap = Object.fromEntries(HABIT_TEMPLATES.map((h) => [h.id, h.name]))

const GENDER_ORDER: Record<string, number> = { Male: 0, Female: 1 }

const GENDER_COLORS: Record<string, string> = {
  Male: 'info',
  Female: 'error',
  'N/A': 'warning',
}

const genderBreakdown = computed(() =>
  (analytics.value?.gender_breakdown ?? [])
    .map((g) => ({ ...g, gender: g.gender === 'Not specified' ? 'N/A' : g.gender }))
    .sort((a, b) => (GENDER_ORDER[a.gender] ?? 99) - (GENDER_ORDER[b.gender] ?? 99)),
)

const totalGender = computed(() => genderBreakdown.value.reduce((s, g) => s + g.count, 0))
</script>

<template>
  <VAppBar color="primary" flat class="border border-b">
    <template #prepend>
      <VBtn
        :icon="didComeFromApp ? 'mdi-account-arrow-left-outline' : 'mdi-home-outline'"
        @click="goBack"
      />
    </template>
    <VAppBarTitle>
      <span class="font-condensed">Admin</span>
    </VAppBarTitle>
  </VAppBar>

  <VMain>
    <VContainer class="pt-4" fluid>
      <VRow justify="center">
        <VCol cols="12" sm="10" md="8" lg="6" xl="4">
          <div
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { type: 'spring', stiffness: 260, damping: 22 },
            }"
          >
            <VCard flat class="mb-4 text-center">
              <VListItem
                :title="profileStore.profile?.name || 'Admin'"
                :subtitle="profileStore.userEmail || ''"
              />
            </VCard>

            <div class="text-overline text-medium-emphasis px-1 mb-4">Filters</div>
            <VRow density="compact" class="mb-4">
              <VCol cols="6">
                <VSelect
                  v-model="selectedYear"
                  label="Batch year"
                  :items="yearItems"
                  density="compact"
                  rounded="xl"
                  variant="outlined"
                  hide-details
                />
              </VCol>
              <VCol cols="6">
                <VSelect
                  v-model="selectedGender"
                  label="Gender"
                  :items="genderItems"
                  density="compact"
                  rounded="xl"
                  variant="outlined"
                  hide-details
                  class="text-capitalize"
                />
              </VCol>
            </VRow>

            <template v-if="isLoading">
              <VSkeletonLoader type="card" class="mb-4 rounded-xl" />
              <VSkeletonLoader type="card" class="mb-4 rounded-xl" />
              <VSkeletonLoader type="card" class="rounded-xl" />
            </template>

            <VAlert v-else-if="error" type="error" rounded="xl" class="mb-4">
              {{ error }}
            </VAlert>

            <VCard v-else-if="isEmpty" rounded="xl" border flat class="mb-4">
              <VCardText class="text-center pa-8">
                <VIcon
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
                <VBtn
                  variant="tonal"
                  size="small"
                  rounded="xl"
                  @click="
                    selectedYear = null
                    selectedGender = null
                  "
                >
                  Clear filters
                </VBtn>
              </VCardText>
            </VCard>

            <template v-else-if="analytics">
              <div class="text-overline text-medium-emphasis px-1 mt-2 mb-2">Overview</div>
              <VRow density="compact" class="mb-4">
                <VCol cols="6">
                  <VCard rounded="xl" border flat>
                    <VCardText class="text-center pa-4">
                      <div class="text-h4 font-weight-bold text-primary">
                        {{ analytics.totals.registered }}
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">Registered</div>
                    </VCardText>
                  </VCard>
                </VCol>
                <VCol cols="6">
                  <VCard rounded="xl" border flat>
                    <VCardText class="text-center pa-4">
                      <div class="text-h4 font-weight-bold text-primary">
                        {{ analytics.totals.assessment_started }}
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">Assessed</div>
                    </VCardText>
                  </VCard>
                </VCol>
                <VCol cols="6">
                  <VCard rounded="xl" border flat>
                    <VCardText class="text-center pa-4">
                      <div class="text-h4 font-weight-bold text-primary">
                        {{ analytics.totals.assessment_complete }}
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">Fully complete</div>
                    </VCardText>
                  </VCard>
                </VCol>
                <VCol cols="6">
                  <VCard rounded="xl" border flat>
                    <VCardText class="text-center pa-4">
                      <div class="text-h4 font-weight-bold text-primary">
                        {{ analytics.totals.with_active_habits }}
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">Active habits</div>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>

              <div class="text-overline text-medium-emphasis px-1 mt-2 mb-2">
                Eco band distribution
              </div>
              <VCard rounded="xl" border flat class="mb-4">
                <VCardText class="pa-4">
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

                  <VTable density="compact" class="mt-3">
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
                  </VTable>
                </VCardText>
              </VCard>

              <div class="text-overline text-medium-emphasis px-1 mt-2 mb-2">Section averages</div>
              <VCard rounded="xl" border flat class="mb-4">
                <VTable density="comfortable">
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
                        <VIcon
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
                          <VProgressLinear
                            :model-value="section.avg_pct"
                            :color="sectionColor(section.avg_pct)"
                            :bg-color="sectionColor(section.avg_pct)"
                            rounded
                            height="10"
                            class="flex-grow-1 mr-2"
                          />
                          <VChip
                            :color="sectionColor(section.avg_pct)"
                            size="x-small"
                            variant="tonal"
                            style="justify-content: center"
                          >
                            {{ section.avg_pct }}%
                          </VChip>
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
                </VTable>
              </VCard>

              <div class="text-overline text-medium-emphasis px-1 mt-2 mb-2">Habit states</div>
              <VRow dense class="mb-4">
                <VCol cols="4">
                  <VCard rounded="xl" border flat>
                    <VCardText class="text-center pa-3">
                      <div class="text-h5 font-weight-bold text-primary">
                        {{ analytics.habit_states.active }}
                      </div>
                      <div class="text-caption text-medium-emphasis">Active</div>
                    </VCardText>
                  </VCard>
                </VCol>
                <VCol cols="4">
                  <VCard rounded="xl" border flat>
                    <VCardText class="text-center pa-3">
                      <div class="text-h5 font-weight-bold text-warning">
                        {{ analytics.habit_states.paused }}
                      </div>
                      <div class="text-caption text-medium-emphasis">Paused</div>
                    </VCardText>
                  </VCard>
                </VCol>
                <VCol cols="4">
                  <VCard rounded="xl" border flat>
                    <VCardText class="text-center pa-3">
                      <div class="text-h5 font-weight-bold text-secondary">
                        {{ analytics.habit_states.mastered }}
                      </div>
                      <div class="text-caption text-medium-emphasis">Mastered</div>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>

              <div class="text-overline text-medium-emphasis px-1 mt-2 mb-2">Habits</div>
              <VCard rounded="xl" border flat class="mb-4">
                <VDataTable
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
                </VDataTable>
              </VCard>

              <div class="text-overline text-medium-emphasis px-1 mt-2 mb-2">Gender breakdown</div>
              <VCard rounded="xl" border flat class="mb-6">
                <VCardText class="pa-4">
                  <div
                    style="
                      display: grid;
                      grid-template-columns: max-content 1fr max-content;
                      align-items: center;
                      gap: 0 12px;
                      row-gap: 12px;
                    "
                  >
                    <template v-for="g in genderBreakdown" :key="g.gender">
                      <span class="text-body-2">{{ g.gender }}</span>
                      <div class="d-flex align-center gap-4">
                        <VProgressLinear
                          :model-value="totalGender > 0 ? (g.count / totalGender) * 100 : 0"
                          :color="GENDER_COLORS[g.gender] ?? 'primary'"
                          :bg-color="GENDER_COLORS[g.gender] ?? 'primary'"
                          rounded
                          height="8"
                          class="flex-grow-1 mr-2"
                        />
                        <VChip
                          :color="GENDER_COLORS[g.gender] ?? 'primary'"
                          size="x-small"
                          variant="tonal"
                          style="justify-content: center"
                        >
                          {{ totalGender > 0 ? Math.round((g.count / totalGender) * 100) : 0 }}%
                        </VChip>
                      </div>
                      <span class="text-body-2 font-weight-medium">{{ g.count }}</span>
                    </template>
                  </div>
                </VCardText>
              </VCard>
            </template>
          </div>
        </VCol>
      </VRow>
    </VContainer>
  </VMain>
</template>
