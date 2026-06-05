<!-- Component -- app bar for the docs view with full-text search and tab slot -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface SearchEntry {
  id: string // unique key, prevents Vuetify virtual-scroll ID collisions
  tab: 'guide' | 'methodology' | 'credits'
  anchor: string // matches a docs-nav id, used to set sectionByTab in DocsView
  section: string
  text: string
}

const emit = defineEmits<{
  navigate: [payload: { tab: 'guide' | 'methodology' | 'credits'; section: string }]
}>()

const TAB_LABELS: Record<string, string> = {
  guide: 'Guide',
  methodology: 'Methodology',
  credits: 'Credits',
}

const INDEX: SearchEntry[] = [
  // ─── Guide ──────────────────────────────────────────────────────────────────
  {
    id: 'guide-overview-overview',
    tab: 'guide',
    anchor: 'overview',
    section: 'Overview',
    text: "Find out what your daily habits actually cost the planet. Answer questions across transport, food, energy, consumption, water, waste, and digital use. See where you stand and where small changes would matter most. Your score updates as you complete sections. Add habits from the library and log them each day to track consistency over time. The app works offline. Anything you do without a connection syncs automatically when you're back online.",
  },
  {
    id: 'guide-getting-started-getting-started',
    tab: 'guide',
    anchor: 'getting-started',
    section: 'Getting started',
    text: "Sign in with Google. No password or separate account needed. Your data is tied to your Google account and syncs across devices automatically. The assessment has seven sections. You can do them in any order and return to finish them later. Each section is submitted once. You can't edit answers after submitting. Resetting a section starts it over completely. Go to the Mastery tab and open the habit library. Log each habit as Yes or No before midnight. Yes builds your streak. Missing a day entirely resets the streak, unless you have a freeze token available.",
  },
  {
    id: 'guide-assessment-assessment',
    tab: 'guide',
    anchor: 'assessment',
    section: 'Assessment',
    text: "The assessment has seven sections. You can complete them in any order and return to finish them whenever you want. Each section carries a different weight. Transport and food together account for about 46% of the total score because they tend to dominate personal footprints. A partial score will be low until all sections are done. The score always normalises against the full total, even if you've only completed some sections. You can't edit a section once it's submitted. Resetting your answers starts over completely.",
  },
  {
    id: 'guide-habits-and-mastery-habits-and-mastery',
    tab: 'guide',
    anchor: 'habits-and-mastery',
    section: 'Habits and mastery',
    text: "A streak counts how many consecutive days you've logged a habit as done. It resets to 0 if you miss a day without a freeze available. Streaks are calculated at the end of each day, not in real time. Logging before midnight counts for that day. A freeze protects your streak when you miss a day entirely. You earn one for every consecutive Yes logs. Miss a day with freezes available and the app spends one on your behalf. A habit is mastered after reaching the mastery streak milestone. It moves to a separate section in your library. Mastering a habit always grants a freeze.",
  },
  {
    id: 'guide-score-and-badges-score-and-badges',
    tab: 'guide',
    anchor: 'score-and-badges',
    section: 'Score and badges',
    text: "Your score runs from 0 to 100. It's calculated across all seven sections, each weighted by how much it contributes to your total footprint. A section is weak when its score is below the threshold percentage of its maximum. The app uses this to determine which sections to flag and which advice to show. Your badge reflects where your overall score lands. The label is a marker, not a judgment. Badges include Starting Out, Becoming Aware, Building Habits, Green Leader, Eco Champion, and Sustainability Exemplar.",
  },
  {
    id: 'guide-insights-insights',
    tab: 'guide',
    anchor: 'insights',
    section: 'Insights',
    text: 'The Insights tab shows your score, a section-by-section breakdown, habit recommendations, and the SDGs your profile touches. The score and badge only reflect your full picture once all seven sections are done. While the assessment is incomplete, the tab shows a partial score and tells you how far along you are. A bar for each completed section coloured by how it scores relative to its own maximum. Sections that score below 50% of their maximum are flagged as weak. Habits drawn from the library that map to your weakest sections. The Sustainable Development Goals your assessment answers relate to.',
  },
  {
    id: 'guide-sync-and-offline-sync-and-offline',
    tab: 'guide',
    anchor: 'sync-and-offline',
    section: 'Sync and offline',
    text: 'The app works fully offline. Any changes you make without a connection are queued locally and synced to the server when you reconnect. Nothing is lost. Data synced means everything is up to date. Syncing data means queued changes are being written to the server now. Restoring your data means the app is loading your data from the server. Offline means no connection detected, the app continues to work, changes queue up and sync automatically when you are back online.',
  },
  {
    id: 'guide-privacy-privacy',
    tab: 'guide',
    anchor: 'privacy',
    section: 'Privacy',
    text: 'The app stores the minimum data needed to function. Nothing is sold or shared with third parties. Your account is identified by your Google account ID and email address. The app stores your assessment answers, habit slots, mastery state, and display name if you set one. A local copy of all data is kept in your browser storage so the app works offline. Data is stored in a Supabase database. Authentication is handled by Supabase Auth via Google OAuth. Your assessment data is only accessible to your own account. You can reset your assessment answers from the Assessment tab. Deleting your account removes all stored data permanently.',
  },

  // ─── Methodology ────────────────────────────────────────────────────────────
  {
    id: 'methodology-overview-overview',
    tab: 'methodology',
    anchor: 'overview',
    section: 'Overview',
    text: "Compost estimates a user's personal environmental footprint across seven behavioural domains using a structured self-assessment. Responses are aggregated into a single normalised score between 0 and 100. This document describes the scoring model, the basis for section weighting, the habit tracking system, and the limitations of the approach.",
  },
  {
    id: 'methodology-overview-assessment-structure',
    tab: 'methodology',
    anchor: 'overview',
    section: 'Assessment structure',
    text: 'The assessment comprises seven sections covering the principal domains of personal environmental impact: transport, food and diet, energy use, consumption, waste, water, and digital habits. Questions are presented as single-select ordinal items with five response options, scored from 1 highest impact to 5 lowest impact. Sections can be completed in any order. Each section is submitted once and cannot be edited after submission.',
  },
  {
    id: 'methodology-scoring-scoring-model',
    tab: 'methodology',
    anchor: 'scoring',
    section: 'Scoring model',
    text: "The raw score for a section is the sum of point values across all answered questions. The maximum raw score equals the question count multiplied by 5. The raw score is scaled to the section's weighted maximum: scaledScore = round rawScore divided by maxRaw multiplied by scaledMax. The overall score normalises completed section totals against the full point maximum: score = round sum of scaledScore divided by total multiplied by 100. The denominator is always the full total, not just completed sections. A partial assessment produces a score that is structurally lower than a fully completed one.",
  },
  {
    id: 'methodology-scoring-section-weighting',
    tab: 'methodology',
    anchor: 'scoring',
    section: 'Section weighting',
    text: 'Section weights reflect the relative contribution of each domain to total personal greenhouse gas emissions, drawing on lifecycle and consumption-pattern research. Transport and food are weighted equally at the top at 23.1% each. Personal vehicles account for approximately 75% of all passenger-transport CO2 emissions globally. Animal-sourced foods contribute 56 to 58% of food-related greenhouse gas emissions. Energy is weighted at 15.4%. Residential energy accounts for approximately 20% of global energy-related CO2. Consumption is 12.3%. Waste is 10.8%. Water and digital are 7.7% each.',
  },
  {
    id: 'methodology-badges-badge-taxonomy',
    tab: 'methodology',
    anchor: 'badges',
    section: 'Badge taxonomy',
    text: "The normalised score maps to one of several badge tiers. Thresholds are calibrated toward an urban Indian context, where most users are expected to fall in the 30 to 65 range on first assessment. A contextual tagline accompanies each badge. The variant shown depends on the number and identity of weak sections. A single weak section triggers a section-specific tagline. Two weak sections trigger a split variant. Three or more trigger a broad variant. A clean profile shows the badge's default tagline.",
  },
  {
    id: 'methodology-habits-habit-tracking',
    tab: 'methodology',
    anchor: 'habits',
    section: 'Habit tracking',
    text: 'A streak counts consecutive days on which a habit was logged as completed. It increments by 1 for each consecutive Yes log and resets to 0 on a missed day subject to the freeze token rule. A No log does not increment the streak but does not trigger a reset either. Streak calculation runs against UTC date at reconciliation time. A freeze token is earned for every consecutive Yes logs up to the balance cap. When a day passes with no log and at least one token is held, the reconciler spends one token and preserves the streak. The token balance may go negative for a group but all habits in it are still protected. A habit is mastered after reaching the mastery streak milestone. On reaching this threshold the habit moves to the mastered archive and the user receives one freeze token unconditionally.',
  },
  {
    id: 'methodology-limitations-limitations',
    tab: 'methodology',
    anchor: 'limitations',
    section: 'Limitations',
    text: "The assessment relies entirely on user self-report. No behavioural data is collected passively. Response accuracy depends on the user's recall and willingness to answer honestly. The score is a relative indicator, not a precise carbon accounting figure. Converting behavioural frequency to a 1 to 5 ordinal scale loses information. Two users selecting the same option may have substantially different actual footprints. Section weights are fixed and derived from global and regional averages. Factors such as grid carbon intensity, local transport infrastructure, and climate affect the true relative importance of each domain. A partial assessment produces a score that cannot be directly compared to a complete one.",
  },
  {
    id: 'methodology-limitations-references',
    tab: 'methodology',
    anchor: 'limitations',
    section: 'References',
    text: "Ellen MacArthur Foundation circular economy tackles climate change. FAO food wastage footprint impacts on natural resources Food and Agriculture Organization. Freitag Berners-Lee Widdicks Knowles real climate transformative impact ICT critique estimates trends regulations Patterns journal. International Energy Agency world energy outlook global EV outlook IEA. Poore Nemecek reducing food's environmental impacts through producers and consumers Science 360 6392 987-992. Bibliography sources research.",
  },

  // ─── Credits ────────────────────────────────────────────────────────────────
  {
    id: 'credits-team-supervisors',
    tab: 'credits',
    anchor: 'team',
    section: 'Supervisors',
    text: "Supervisors Fr. Joby Joseph Vice Principal Dr. Medari Janai Tham Associate Professor commissioned project St. Anthony's College Shillong Meghalaya academic.",
  },
  {
    id: 'credits-team-students',
    tab: 'credits',
    anchor: 'team',
    section: 'Students',
    text: "Students Constantine Kharsyntiew content research. Lawanbiang Kshiar content research. Markordor Sohtun content research. Vivian Alexander L Nonglait software development. St. Anthony's College Shillong contributors team members.",
  },
  {
    id: 'credits-stack-stack',
    tab: 'credits',
    anchor: 'stack',
    section: 'Stack',
    text: 'Vue 3 Composition API reactive state component model. Vuetify Material Design 3 component library for Vue. Supabase authentication PostgreSQL database cross-device sync. Pinia store management persistence across sessions. vueuse motion spring keyframe animations Composition API. TypeScript type-safe data models stores composables. Vite vite-plugin-pwa build tooling offline Progressive Web App support. Material Design Icons open-source icon set Pictogrammers materialdesignicons.com. open source libraries dependencies.',
  },
  {
    id: 'credits-license-license',
    tab: 'credits',
    anchor: 'license',
    section: 'License',
    text: 'MIT License copyright 2026 Vivian Alexander L Nonglait. Permission is hereby granted free of charge to any person obtaining a copy of this software to deal in the Software without restriction including the rights to use copy modify merge publish distribute sublicense sell. The above copyright notice and this permission notice shall be included in all copies. Open source attribution repository legal terms.',
  },
]

const router = useRouter()

const isSearchMode = ref(false)
const searchQuery = ref('')

function customFilter(_value: string, query: string, item?: { raw: SearchEntry }): boolean {
  if (!item) return false
  const q = query.trim().toLowerCase()
  if (!q) return false
  const e = item.raw
  return (
    e.text.toLowerCase().includes(q) ||
    e.section.toLowerCase().includes(q) ||
    (TAB_LABELS[e.tab] ?? '').toLowerCase().includes(q)
  )
}

function highlight(text: string, query: string): string {
  const q = query.trim()
  if (!q || q.length < 2) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
}

function getItemProps(item: SearchEntry) {
  const q = searchQuery.value.trim().toLowerCase()
  let context = ''
  if (q.length >= 2) {
    const lower = item.text.toLowerCase()
    const idx = lower.indexOf(q)
    if (idx !== -1) {
      const RADIUS = 55
      const start = Math.max(0, idx - RADIUS)
      const end = Math.min(item.text.length, idx + q.length + RADIUS)
      context =
        (start > 0 ? '\u2026' : '') +
        item.text.slice(start, end).trim() +
        (end < item.text.length ? '\u2026' : '')
    }
  }
  return {
    subtitle: TAB_LABELS[item.tab] + (context ? ' · ' + context : ''),
  }
}

function toggleSearch() {
  isSearchMode.value = !isSearchMode.value
}

function closeSearch() {
  isSearchMode.value = false
  searchQuery.value = ''
}

function onSearchUpdate(q: string | undefined) {
  searchQuery.value = q ?? ''
}

function navigate(id: string | null) {
  if (!id) return
  const entry = INDEX.find((e) => e.id === id)
  if (!entry) return
  closeSearch()
  emit('navigate', { tab: entry.tab, section: entry.anchor })
}

const didComeFromApp = !!window.history.state?.back

function goHome() {
  router.push(didComeFromApp ? { path: '/profile' } : { path: '/' })
}
</script>

<template>
  <VAppBar color="primary" flat class="border border-b">
    <template #prepend>
      <VBtn
        :icon="didComeFromApp ? 'mdi-account-arrow-left-outline' : 'mdi-home-outline'"
        @click="goHome"
      />
    </template>

    <VAppBarTitle v-if="!isSearchMode">
      <span class="font-condensed">Documentation</span>
    </VAppBarTitle>

    <VAutocomplete
      v-if="isSearchMode"
      variant="solo"
      flat
      :items="searchQuery.trim().length >= 2 ? INDEX : []"
      :custom-filter="customFilter"
      :item-props="getItemProps"
      item-title="section"
      item-value="id"
      density="compact"
      hide-details
      autofocus
      auto-select-first
      placeholder="Search the docs…"
      no-data-text="Nothing found"
      :hide-no-data="searchQuery.trim().length >= 2 ? false : true"
      @update:search="onSearchUpdate"
      @update:model-value="navigate"
    >
      <template #item="{ props: itemProps }">
        <VListItem v-bind="itemProps" lines="two" rounded="lg">
          <template #title>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="highlight(itemProps.title as string, searchQuery)" />
          </template>
          <template #subtitle>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="highlight(itemProps.subtitle as string, searchQuery)" />
          </template>
        </VListItem>
      </template>
    </VAutocomplete>

    <template #append>
      <VBtn :icon="isSearchMode ? 'mdi-close' : 'mdi-magnify'" @click="toggleSearch" />
    </template>

    <template #extension>
      <slot name="tabs" />
    </template>
  </VAppBar>
</template>
