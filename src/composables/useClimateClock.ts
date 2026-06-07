// Composable -- climate clock data fetching, countdown timer, and lifeline rotation
import { ref, computed, onUnmounted } from 'vue'
import { useIntervalFn, useEventListener } from '@vueuse/core'
import { useClockDataStore } from '@/stores/clock-data.store'
import type {
  ClockModule,
  NewsfeedItem,
  Lifeline,
  ClockDisplay,
  ParsedUnit,
} from '@/types/app.types'

const LIFELINE_KEYS = [
  'renewables_1',
  'regen_agriculture',
  'loss_damage_g7_debt',
  'loss_damage_g20_debt',
  'indigenous_land_1',
  'women_in_parliaments',
  'initiative_30x30',
  'end_subsidies',
  'ff_divestment_stand_dot_earth',
  'actnow',
  '_youth_anxiety',
] as const

const UNIT_OVERRIDES: Partial<Record<string, ParsedUnit>> = {
  women_in_parliaments: { prefix: '', unit: '% Women', scale: 1 },
  initiative_30x30: { prefix: '', unit: '% by 2030', scale: 1 },
  ff_divestment_stand_dot_earth: { prefix: '₹', unit: 'Lakh Crore', scale: 1 },
  indigenous_land_1: { prefix: '', unit: 'Lakh sq. km', scale: 10 },
  _youth_anxiety: { prefix: '', unit: '% Youth', scale: 1 },
}

// ─── State ───────────────────────────────────────────────────────────────────

const initialized = ref(false)
const loading = ref(false)
const now = ref(new Date())
const deadlineTs = ref<Date | null>(null)
const deadlineLabel = ref('Time left to limit global warming to 1.5°C')
const lifelines = ref<Lifeline[]>([])
const lifelineIndex = ref(0)
const tickerItems = ref<NewsfeedItem[]>([])
const isStale = ref(false)
const fetchFailed = ref(false)

// Consumer counter: ticks pause when the last consumer unmounts.
let consumers = 0

// Called at module scope so the refs are shared across all consumers.
// tryOnScopeDispose inside useIntervalFn is a no-op here; we manage
// pause/resume explicitly via the consumer counter.
const { pause: pauseClock, resume: resumeClock } = useIntervalFn(
  () => {
    now.value = new Date()
  },
  1000,
  { immediate: false },
)

const { pause: pauseLifeline, resume: resumeLifeline } = useIntervalFn(
  () => {
    lifelineIndex.value = (lifelineIndex.value + 1) % lifelines.value.length
  },
  6000,
  { immediate: false },
)

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pad = (n: number, len = 2) => String(n).padStart(len, '0')

function parseUnit(key: string, raw: string): ParsedUnit {
  if (UNIT_OVERRIDES[key]) return UNIT_OVERRIDES[key]!
  if (raw === '$T' || raw === '$ Trillion') return { prefix: '₹', unit: 'Lakh Crore', scale: 1 }
  if (raw === '$B' || raw === '$ Billion') return { prefix: '₹', unit: 'Crore', scale: 100 }
  if (raw.startsWith('$')) return { prefix: '₹', unit: raw.slice(1).trim(), scale: 1 }
  return { prefix: '', unit: raw, scale: 1 }
}

function moduleToLifeline(key: string, m: ClockModule): Lifeline {
  const { prefix, unit, scale } = parseUnit(key, m.unit_labels?.[0] ?? '')
  return {
    key,
    label: m.labels?.[0] ?? key,
    prefix,
    unit,
    scale,
    initial: m.initial ?? 0,
    rate: m.rate ?? 0,
    origin: new Date(m.timestamp ?? ''),
    resolution: m.resolution ?? 1,
  }
}

function hydrate(modules: Record<string, ClockModule>) {
  const deadline = modules['carbon_deadline_1']
  if (deadline?.timestamp) deadlineTs.value = new Date(deadline.timestamp)
  if (deadline?.labels?.[0]) deadlineLabel.value = deadline.labels[0]

  lifelines.value = LIFELINE_KEYS.flatMap((key) =>
    modules[key] ? [moduleToLifeline(key, modules[key])] : [],
  )
  tickerItems.value = modules['newsfeed_1']?.newsfeed ?? []
}

function hydrateFromStore(store: ReturnType<typeof useClockDataStore>) {
  if (store.deadlineTs) deadlineTs.value = new Date(store.deadlineTs)
  if (store.deadlineLabel) deadlineLabel.value = store.deadlineLabel
  if (store.lifelines)
    lifelines.value = store.lifelines.map((lf) => ({
      ...lf,
      origin: lf.origin instanceof Date ? lf.origin : new Date(lf.origin as string),
    }))
  if (store.tickerItems) tickerItems.value = store.tickerItems
}

function startTicks() {
  resumeClock()
  resumeLifeline()
}

async function fetchAndPersist(store: ReturnType<typeof useClockDataStore>) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  const res = await fetch('https://api.climateclock.world/v2/clock.json', {
    signal: controller.signal,
  })
  clearTimeout(timeout)

  const { data } = (await res.json()) as { data: { modules: Record<string, ClockModule> } }
  hydrate(data.modules)

  store.deadlineTs = deadlineTs.value?.toISOString() ?? null
  store.deadlineLabel = deadlineLabel.value
  store.lifelines = lifelines.value
  store.tickerItems = tickerItems.value
  store.cachedAt = Date.now()

  isStale.value = false
  fetchFailed.value = false
}

async function init() {
  if (loading.value) return

  if (initialized.value) {
    startTicks()
    return
  }

  const store = useClockDataStore()
  const hasCachedData = store.isCacheValid && !!store.deadlineTs

  if (hasCachedData) {
    hydrateFromStore(store)
    initialized.value = true
    startTicks()
  }

  // Only show loading skeleton on a true cold start (no cache at all).
  if (!hasCachedData) loading.value = true

  try {
    await fetchAndPersist(store)
    initialized.value = true
    startTicks()
  } catch {
    if (!store.deadlineTs) {
      fetchFailed.value = true // first ever load, no cache, no network
    } else {
      isStale.value = true // cache exists but couldn't refresh
    }
  } finally {
    loading.value = false
  }
}

function onOnline() {
  if (isStale.value || fetchFailed.value) {
    initialized.value = false
    init()
  }
}

export function useClimateClock() {
  consumers++
  init()

  // useEventListener auto-removes on unmount; no manual removeEventListener needed.
  useEventListener(window, 'online', onOnline)

  onUnmounted(() => {
    // Pause the shared intervals only when the last consumer unmounts.
    // pauseClock/pauseLifeline are idempotent; safe to call even if already paused.
    if (--consumers === 0) {
      pauseClock()
      pauseLifeline()
    }
  })

  const cd = computed<ClockDisplay>(() => {
    const ts = deadlineTs.value
    const s = ts ? Math.max(0, Math.floor((ts.getTime() - now.value.getTime()) / 1000)) : 0
    return {
      years: pad(Math.floor(s / 86400 / 365)),
      days: pad(Math.floor((s / 86400) % 365), 3),
      hours: pad(Math.floor((s / 3600) % 24)),
      mins: pad(Math.floor((s / 60) % 60)),
      secs: pad(s % 60),
    }
  })

  const currentLifeline = computed(() => lifelines.value[lifelineIndex.value] ?? null)

  const lifelineDisplay = computed(() => {
    const lf = currentLifeline.value
    if (!lf) return ''
    const raw = lf.initial + lf.rate * ((now.value.getTime() - lf.origin.getTime()) / 1000)
    const v = raw * lf.scale
    const dec =
      lf.resolution < 0.000001
        ? 8
        : lf.resolution < 0.01
          ? 6
          : lf.resolution < 0.1
            ? 2
            : lf.resolution < 1
              ? 1
              : 0
    return (
      lf.prefix +
      v.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec })
    )
  })

  return {
    loading,
    deadlineLabel,
    cd,
    currentLifeline,
    lifelineDisplay,
    lifelineIndex,
    tickerItems,
    isStale,
    fetchFailed,
  }
}
