// ═══════════════════════════════════════════════════════════════════════════════
// masteryStore — local driver for the habit ledger system
// ═══════════════════════════════════════════════════════════════════════════════
//
// ARCHITECTURE
// ────────────
// The four ref arrays below are local mirrors of the four append-only Supabase
// tables. They are the single source of truth for all habit state in the app.
//
//   habitLogs       ←→  habit_logs       (one row per logged day per habit)
//   freezeLedger    ←→  freeze_ledger    (one row per freeze token event)
//   slotEvents      ←→  slot_events      (one row per lifecycle event per habit)
//   masteredArchive ←→  mastered_archive (one row per retired habit, written once)
//
// Every UI value — streak counts, freeze balances, active habit lists, mastery
// status — is derived from these arrays at runtime. Nothing is cached or stored
// twice. The arrays are the database, held in memory and persisted to localStorage.
//
// WRITE OWNERSHIP
// ───────────────
// habit_logs    — CLIENT ONLY. Values: 'yes' or 'no'. Unique on (user_id, template_id, date).
//                 The cron never writes here. No conflict with server is possible.
//
// freeze_ledger — CLIENT writes milestone (+1) and mastery (+1) rows.
//                 CRON writes spent (-1) rows at midnight IST when protecting
//                 an unlogged habit. These are in different rows and never conflict.
//
// slot_events   — CLIENT ONLY.
// mastered_archive — CLIENT ONLY.
//
// FREEZE PROTECTION — HOW THE RACE CONDITION IS RESOLVED
// ───────────────────────────────────────────────────────
// The cron runs at midnight IST and writes a spent row to freeze_ledger for each
// unlogged active habit that has tokens available. It does not write to habit_logs.
//
// If a device was offline with a queued yes/no and comes online after the cron:
//   1. Drain inserts the yes/no into habit_logs — no conflict (cron never wrote there).
//   2. The spent row in freeze_ledger still exists.
//   3. freezeCount ignores spent rows where a log now exists for that date — the
//      token is implicitly refunded. No refund row, no UPDATE, no band-aid.
//   4. The streak walk finds the yes/no row and never reaches the protection check.
//
// Everything is append-only throughout. Correctness is derived, not stored.
//
// DATE FORMAT
// ───────────
// All date strings are IST (UTC+05:30) YYYY-MM-DD. See habitDate.ts.
//
// PHASE NOTES
// ───────────
// Phase 3: all logic runs against in-memory arrays. No Supabase calls.
// Phase 4: hydrateFromSupabase() and enqueue() calls wired in.
// Phase 5: four Realtime listeners append incoming server rows.
// ═══════════════════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { HABIT_TEMPLATES } from '@/data/habits'
import { todayISO, yesterdayISO } from '@/utils/habitDate'
import type {
  HabitTemplate,
  UserHabit,
  HabitLog,
  FreezeLedgerRow,
  SlotEvent,
  MasteredEntry,
  LedgerReconcileEvent,
} from '@/types/app'
import {
  MAX_SLOTS,
  FREEZE_MILESTONE,
  MASTERY_MILESTONE,
  FREEZE_CAP,
  DEBT_FLOOR,
} from '@/types/app'
import { useSyncStore } from '@/stores/sync'
import { supabase } from '@/services/supabase'

// ─── Module-level helpers ─────────────────────────────────────────────────────

function isoNow(): string {
  return new Date().toISOString()
}

/** Shift a YYYY-MM-DD string one day back. */
function prevDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

/**
 * Build a UserHabit view-model from a HabitTemplate and ledger-derived values.
 * Components consume these view-models — they never hold references to raw
 * ledger rows. In the ledger model there is no mutable slot object; this
 * function constructs the equivalent on-the-fly from live computed values.
 */
function buildUserHabit(
  template: HabitTemplate,
  streakVal: number,
  isMasteredVal: boolean,
  freezeUsedVal: boolean,
): UserHabit {
  return {
    id: template.id,
    templateId: template.id,
    name: template.name,
    icon: template.icon,
    iconOutline: template.iconOutline,
    sectionId: template.sectionId,
    prompt: template.prompt,
    when: template.when,
    instruction: template.instruction,
    streak: streakVal,
    lastLoggedDate: null,
    isPaused: false,
    freezeUsed: freezeUsedVal,
    isMastered: isMasteredVal,
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMasteryStore = defineStore('mastery', () => {

  // ── Ledger arrays — the local database ───────────────────────────────────
  //
  // Append-only. Rows are pushed in, never spliced or mutated in place.
  // Persisted to localStorage as the local cache between sessions.
  // Phase 4 hydration union-merges server rows: server rows not present
  // locally are appended; local rows are never removed.

  const habitLogs       = ref<HabitLog[]>([])
  const freezeLedger    = ref<FreezeLedgerRow[]>([])
  const slotEvents      = ref<SlotEvent[]>([])
  const masteredArchive = ref<MasteredEntry[]>([])

  // Session-scoped. Holds the outcome of the last reconcile() so the UI can
  // show "streak lost" notices. Not persisted. Cleared when allLoggedToday fires.
  const lastReconcileEvents = ref<LedgerReconcileEvent[]>([])

  // Populated from the Supabase auth session during hydrateFromSupabase().
  // Carried on every enqueued row so the drain can write user_id to Supabase.
  const userId = ref<string>('')

  // ── Internal read helpers ─────────────────────────────────────────────────

  /** Latest SlotEvent per template_id — used by all habit list computeds. */
  function latestEventMap(): Map<string, SlotEvent> {
    const map = new Map<string, SlotEvent>()
    for (const event of slotEvents.value) {
      const existing = map.get(event.template_id)
      if (!existing || event.created_at > existing.created_at) {
        map.set(event.template_id, event)
      }
    }
    return map
  }

  /**
   * True if the habit was in 'paused' lifecycle state on the given IST date.
   * Used by the streak walker to skip pause/resume gaps transparently.
   */
  function isPausedOnDate(templateId: string, date: string): boolean {
    const endOfDay = date + 'T23:59:59.999Z'
    let latest: SlotEvent | null = null
    for (const e of slotEvents.value) {
      if (e.template_id !== templateId) continue
      if (e.created_at > endOfDay) continue
      if (!latest || e.created_at > latest.created_at) latest = e
    }
    return latest?.event === 'paused'
  }

  /** True if habitLogs has any row for (templateId, date). */
  function hasLogForDate(templateId: string, date: string): boolean {
    return habitLogs.value.some(l => l.template_id === templateId && l.date === date)
  }

  // ── Derived values ────────────────────────────────────────────────────────
  //
  // All derived from ledger arrays. Strictly read-only — derivation never
  // writes to any array.

  /**
   * Streak for a template — count of consecutive 'yes' days walking backward.
   *
   * @param templateId  The habit to measure.
   * @param asOf        Optional anchor date (YYYY-MM-DD IST). Defaults to today.
   *                    Pass the date of the last known log to capture the pre-loss
   *                    streak (see lastKnownStreak). When anchored, the "today not
   *                    yet logged" transparent skip is suppressed — the walk simply
   *                    starts at asOf and applies normal rules from there.
   *
   * Walk rules (evaluated in order for each date):
   *   1. Log exists, value 'yes'                → count++, continue
   *   2. Log exists, value 'no'                 → continue (chain preserved, not counted)
   *   3. No log, date is today AND not anchored → skip (not yet logged, transparent)
   *   4. No log, habit was paused on this date  → skip (lifecycle gap, transparent)
   *   5. No log, spent row in freeze_ledger     → skip (cron protected this gap)
   *   6. No log, nothing                        → STOP (unprotected gap, streak ends)
   *
   * Rule 5 reads freeze_ledger directly. The "frozen" concept lives in the
   * token economy table, not in habit_logs. habit_logs is user actions only.
   *
   * The boundary is the last 'added' event for this template — re-adding a
   * habit resets the streak window to that date.
   */
  function streak(templateId: string, asOf?: string): number {
    const events = slotEvents.value.filter(e => e.template_id === templateId)
    if (events.length === 0) return 0

    const lastAdded = [...events]
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .find(e => e.event === 'added')
    if (!lastAdded) return 0
    const boundaryDate = lastAdded.created_at.slice(0, 10)

    // Build fast lookup structures from the ledgers.
    // logMap: date → 'yes' | 'no'
    const logMap = new Map<string, 'yes' | 'no'>()
    for (const l of habitLogs.value) {
      if (l.template_id === templateId && l.date >= boundaryDate) {
        logMap.set(l.date, l.value)
      }
    }

    // spentSet: dates where the cron spent a freeze token for this template.
    // Only relevant for gap dates — if a log exists the walk never checks this.
    const spentSet = new Set<string>()
    for (const r of freezeLedger.value) {
      if (r.template_id === templateId && r.reason === 'spent') {
        spentSet.add(r.date)
      }
    }

    const referenceDate = asOf ?? todayISO()
    const isAnchored = asOf !== undefined
    let count = 0
    let dateStr = referenceDate

    while (dateStr >= boundaryDate) {
      const value = logMap.get(dateStr)

      if (value !== undefined) {
        // Rule 1 & 2 — log exists.
        if (value === 'yes') count++
        // 'no' continues chain without counting.
        dateStr = prevDate(dateStr)
        continue
      }

      // Rules 3–6 — no log for this date.
      if (dateStr === referenceDate && !isAnchored) {
        // Rule 3: today not yet logged — transparent skip.
        // Suppressed when anchored: an anchored walk starts exactly at asOf
        // and applies normal gap rules from the first date down.
        dateStr = prevDate(dateStr)
        continue
      }

      if (isPausedOnDate(templateId, dateStr)) {
        // Rule 4: habit was paused — transparent gap.
        dateStr = prevDate(dateStr)
        continue
      }

      if (spentSet.has(dateStr)) {
        // Rule 5: cron spent a token to protect this gap.
        dateStr = prevDate(dateStr)
        continue
      }

      // Rule 6: unprotected gap — streak ends here.
      break
    }

    return count
  }

  /**
   * The streak value the user had before the current gap broke it.
   * Used by reconcile() so "streak lost" notices show the correct number
   * instead of 0 (which is what streak() returns after the gap has formed).
   *
   * Anchors the walk to the most recent logged date. If the last log was a 'no',
   * the chain was still alive through it — the streak value is correct.
   */
  function lastKnownStreak(templateId: string): number {
    const lastLog = [...habitLogs.value]
      .filter(l => l.template_id === templateId)
      .sort((a, b) => (a.date < b.date ? 1 : -1))[0]
    if (!lastLog) return 0
    return streak(templateId, lastLog.date)
  }

  /**
   * Net freeze token balance.
   *
   * Spent rows (cron-written) are only effective when no habit_log exists for
   * the same (template_id, date). If a late yes/no arrived after the cron wrote
   * a spent row, the spend becomes a no-op and the token is implicitly back in
   * the balance — no refund row, no UPDATE required.
   *
   * Balance is floored at DEBT_FLOOR.
   */
  const freezeCount = computed((): number => {
    const raw = freezeLedger.value.reduce((sum, row) => {
      if (row.reason !== 'spent') return sum + row.delta

      // Spent row: only deduct if no client log exists for that date.
      const logArrived = habitLogs.value.some(
        l => l.template_id === row.template_id && l.date === row.date
      )
      return logArrived ? sum : sum + row.delta  // delta is -1; skipping = implicit refund
    }, 0)

    return Math.max(raw, DEBT_FLOOR)
  })

  /**
   * True if any log exists for (templateId, today), regardless of value.
   * Accepts either a template id string or a UserHabit object — the MasteryView
   * template passes displayHabit() results directly here.
   */
  function isLoggedToday(templateIdOrHabit: string | { templateId: string }): boolean {
    const tId = typeof templateIdOrHabit === 'string'
      ? templateIdOrHabit
      : templateIdOrHabit.templateId
    return hasLogForDate(tId, todayISO())
  }

  /** True if streak === MASTERY_MILESTONE or template is in masteredArchive. */
  function isMastered(templateId: string): boolean {
    if (masteredArchive.value.some(m => m.template_id === templateId)) return true
    return streak(templateId) === MASTERY_MILESTONE
  }

  /**
   * True if the cron spent a freeze token to protect this habit yesterday AND:
   *   - No log arrived for that date (which would make the spend a no-op).
   *   - The current streak is > 0 (the protection actually kept the chain alive;
   *     if streak is 0 the chain was already broken before the cron ran, meaning
   *     the token was wasted — don't show the "protected" chip in that state).
   *
   * This drives the "streak protected" chip on HabitCard.
   */
  function isFreezeUsed(templateId: string): boolean {
    // Guard: protection chip only shows if the chain is actually still alive.
    // A 0 streak means the chain broke before or in spite of the freeze spend.
    if (streak(templateId) === 0) return false

    const yesterday = yesterdayISO()
    const wasProtected = freezeLedger.value.some(
      r => r.template_id === templateId && r.date === yesterday && r.reason === 'spent'
    )
    if (!wasProtected) return false
    // Spent row is only "visible" if no log exists — if the log arrived, the
    // spend is a no-op and we don't surface it as a protection event.
    return !habitLogs.value.some(
      l => l.template_id === templateId && l.date === yesterday
    )
  }

  // ── Computed habit lists ──────────────────────────────────────────────────

  /**
   * Habits in an active slot: latest event 'added' or 'resumed', not archived,
   * streak < MASTERY_MILESTONE. Habits at 66 go into masteredHabits.
   */
  const activeHabits = computed((): UserHabit[] => {
    const latestMap = latestEventMap()
    const archivedIds = new Set(masteredArchive.value.map(m => m.template_id))
    const result: UserHabit[] = []

    for (const [tId, event] of latestMap) {
      if (event.event !== 'added' && event.event !== 'resumed') continue
      if (archivedIds.has(tId)) continue
      const s = streak(tId)
      if (s === MASTERY_MILESTONE) continue
      const template = HABIT_TEMPLATES.find(t => t.id === tId)
      if (!template) continue
      result.push(buildUserHabit(template, s, false, isFreezeUsed(tId)))
    }
    return result
  })

  /** Habits in a paused slot: latest event 'paused'. */
  const pausedHabits = computed((): UserHabit[] => {
    const latestMap = latestEventMap()
    const result: UserHabit[] = []

    for (const [tId, event] of latestMap) {
      if (event.event !== 'paused') continue
      const template = HABIT_TEMPLATES.find(t => t.id === tId)
      if (!template) continue
      result.push(buildUserHabit(template, streak(tId), false, isFreezeUsed(tId)))
    }
    return result
  })

  /**
   * Active habits at streak === MASTERY_MILESTONE, awaiting the retire flow.
   * Still occupy a slot. Distinct from masteredArchive (already retired).
   */
  const masteredHabits = computed((): UserHabit[] => {
    const latestMap = latestEventMap()
    const archivedIds = new Set(masteredArchive.value.map(m => m.template_id))
    const result: UserHabit[] = []

    for (const [tId, event] of latestMap) {
      if (event.event !== 'added' && event.event !== 'resumed') continue
      if (archivedIds.has(tId)) continue
      if (streak(tId) !== MASTERY_MILESTONE) continue
      const template = HABIT_TEMPLATES.find(t => t.id === tId)
      if (!template) continue
      result.push(buildUserHabit(template, MASTERY_MILESTONE, true, false))
    }
    return result
  })

  const allLoggedToday = computed((): boolean => {
    if (activeHabits.value.length === 0) return false
    return activeHabits.value.every(h => isLoggedToday(h.templateId))
  })

  const unloggedToday = computed((): UserHabit[] =>
    activeHabits.value.filter(h => !isLoggedToday(h.templateId)),
  )

  const daysToNextFreeze = computed((): number | null => {
    if (activeHabits.value.length === 0) return null
    const values = activeHabits.value.map(h => {
      const s = streak(h.templateId)
      return FREEZE_MILESTONE - (s % FREEZE_MILESTONE)
    })
    return Math.min(...values)
  })

  const daysToNextMastery = computed((): number | null => {
    const qualifying = activeHabits.value.filter(h => streak(h.templateId) >= 1)
    if (qualifying.length === 0) return null
    const values = qualifying.map(h => {
      const s = streak(h.templateId)
      return MASTERY_MILESTONE - (s % MASTERY_MILESTONE)
    })
    return Math.min(...values)
  })

  const activeTemplateIds = computed((): Set<string> =>
    new Set(activeHabits.value.map(h => h.templateId)),
  )
  const pausedTemplateIds = computed((): Set<string> =>
    new Set(pausedHabits.value.map(h => h.templateId)),
  )

  /** All mastered templates — retired (masteredArchive) + pending retire (masteredHabits). */
  const masteredTemplateIds = computed((): Set<string> => {
    const s = new Set(masteredArchive.value.map(m => m.template_id))
    for (const h of masteredHabits.value) s.add(h.templateId)
    return s
  })

  const masteredSlotTemplateIds = computed((): Set<string> =>
    new Set(masteredHabits.value.map(h => h.templateId)),
  )

  /** Total slots occupied: latest event is 'added', 'resumed', or 'paused'. */
  const usedSlots = computed((): number => {
    const latestMap = latestEventMap()
    let count = 0
    for (const event of latestMap.values()) {
      if (event.event === 'added' || event.event === 'resumed' || event.event === 'paused') count++
    }
    return count
  })

  // ── Actions ───────────────────────────────────────────────────────────────
  //
  // Each action appends rows to local ledger arrays then enqueues for Supabase.
  // UI updates are immediate — no await, no loading states.
  //
  // None of these actions write spent rows to freeze_ledger. Spent rows are
  // cron-only. None write to habit_logs with any value other than 'yes'/'no'.

  /** Add a habit to an available slot. No-op if template is already active or paused. */
  function addHabit(template: HabitTemplate): void {
    if (activeTemplateIds.value.has(template.id) || pausedTemplateIds.value.has(template.id)) return
    const now = isoNow()
    const event: SlotEvent = {
      user_id: userId.value,
      template_id: template.id,
      event: 'added',
      created_at: now,
    }
    slotEvents.value.push(event)

    const syncStore = useSyncStore()
    // slot_events: append-only ledger insert (ignoreDuplicates on server)
    syncStore.enqueue({
      id: `slot_events:${userId.value}:${template.id}:${now}`,
      table: 'slot_events',
      operation: 'upsert',
      payload: event,
      enqueuedAt: Date.now(),
    })
    // habit_slots: lightweight index upsert (idempotent; conflict = do nothing meaningful)
    syncStore.enqueue({
      id: `habit_slots:${userId.value}:${template.id}`,
      table: 'habit_slots',
      operation: 'upsert',
      payload: { user_id: userId.value, template_id: template.id, created_at: now },
      enqueuedAt: Date.now(),
    })
  }

  /**
   * Remove a habit from its slot. If a streak exists, a 'paused' event is
   * inserted first so the streak is preserved in the slotEvents history.
   * habit_logs rows are never deleted — they remain as an accurate record.
   */
  function removeHabit(templateId: string): void {
    const syncStore = useSyncStore()

    if (streak(templateId) > 0) {
      const pauseNow = isoNow()
      const pauseEvent: SlotEvent = {
        user_id: userId.value,
        template_id: templateId,
        event: 'paused',
        created_at: pauseNow,
      }
      slotEvents.value.push(pauseEvent)
      syncStore.enqueue({
        id: `slot_events:${userId.value}:${templateId}:${pauseNow}`,
        table: 'slot_events',
        operation: 'upsert',
        payload: pauseEvent,
        enqueuedAt: Date.now(),
      })
    }

    const removeNow = isoNow()
    const removeEvent: SlotEvent = {
      user_id: userId.value,
      template_id: templateId,
      event: 'removed',
      created_at: removeNow,
    }
    slotEvents.value.push(removeEvent)
    syncStore.enqueue({
      id: `slot_events:${userId.value}:${templateId}:${removeNow}`,
      table: 'slot_events',
      operation: 'upsert',
      payload: removeEvent,
      enqueuedAt: Date.now(),
    })
  }

  /** Pause a habit. Slot held, streak preserved, excluded from daily log flow. */
  function pauseHabit(templateId: string): void {
    const now = isoNow()
    const event: SlotEvent = {
      user_id: userId.value,
      template_id: templateId,
      event: 'paused',
      created_at: now,
    }
    slotEvents.value.push(event)
    useSyncStore().enqueue({
      id: `slot_events:${userId.value}:${templateId}:${now}`,
      table: 'slot_events',
      operation: 'upsert',
      payload: event,
      enqueuedAt: Date.now(),
    })
  }

  /** Resume a paused habit. Streak walker skips the pause/resumed range transparently. */
  function resumeHabit(templateId: string): void {
    const now = isoNow()
    const event: SlotEvent = {
      user_id: userId.value,
      template_id: templateId,
      event: 'resumed',
      created_at: now,
    }
    slotEvents.value.push(event)
    useSyncStore().enqueue({
      id: `slot_events:${userId.value}:${templateId}:${now}`,
      table: 'slot_events',
      operation: 'upsert',
      payload: event,
      enqueuedAt: Date.now(),
    })
  }

  /** Remove one habit and add another atomically (slots-full swap flow). */
  function swapHabit(removeTemplateId: string, template: HabitTemplate): void {
    removeHabit(removeTemplateId)
    addHabit(template)
  }

  /**
   * Log a habit for today. Idempotent — a second call for the same habit on
   * the same IST date is a no-op locally (unique constraint enforces this on
   * the server; hasLogForDate enforces it locally).
   *
   * 'yes' checks for milestone and mastery freeze token grants:
   *   - Every FREEZE_MILESTONE yes days: +1 token, capped at FREEZE_CAP.
   *   - At MASTERY_MILESTONE: +1 token, unconditional (ignores cap).
   *
   * 'no' records the day without counting toward 66 or breaking the chain.
   */
  function logHabit(templateId: string, value: 'yes' | 'no'): void {
    const today = todayISO()
    if (hasLogForDate(templateId, today)) return

    const now = isoNow()
    const logRow: HabitLog = {
      user_id: userId.value,
      template_id: templateId,
      date: today,
      value,
      created_at: now,
    }
    habitLogs.value.push(logRow)

    const syncStore = useSyncStore()
    syncStore.enqueue({
      id: `habit_logs:${userId.value}:${templateId}:${today}`,
      table: 'habit_logs',
      operation: 'upsert',
      payload: logRow,
      enqueuedAt: Date.now(),
    })

    if (value === 'yes') {
      const s = streak(templateId) // recalculate after the insert

      if (s % FREEZE_MILESTONE === 0 && s < MASTERY_MILESTONE && freezeCount.value < FREEZE_CAP) {
        const milestoneRow: FreezeLedgerRow = {
          user_id: userId.value,
          template_id: templateId,
          delta: +1,
          reason: 'milestone',
          date: today,
          created_at: isoNow(),
        }
        freezeLedger.value.push(milestoneRow)
        syncStore.enqueue({
          id: `freeze_ledger:${userId.value}:${templateId}:${today}:milestone`,
          table: 'freeze_ledger',
          operation: 'upsert',
          payload: milestoneRow,
          enqueuedAt: Date.now(),
        })
      }

      if (s === MASTERY_MILESTONE) {
        const masteryRow: FreezeLedgerRow = {
          user_id: userId.value,
          template_id: templateId,
          delta: +1,
          reason: 'mastery',
          date: today,
          created_at: isoNow(),
        }
        freezeLedger.value.push(masteryRow)
        syncStore.enqueue({
          id: `freeze_ledger:${userId.value}:${templateId}:${today}:mastery`,
          table: 'freeze_ledger',
          operation: 'upsert',
          payload: masteryRow,
          enqueuedAt: Date.now(),
        })
      }
    }
  }

  /** Retire a mastered habit from its slot into the permanent archive. */
  function retireHabit(templateId: string): void {
    const now = isoNow()
    const slotEvent: SlotEvent = {
      user_id: userId.value,
      template_id: templateId,
      event: 'retired',
      created_at: now,
    }
    const archiveEntry: MasteredEntry = {
      user_id: userId.value,
      template_id: templateId,
      created_at: now,
    }

    slotEvents.value.push(slotEvent)
    masteredArchive.value.push(archiveEntry)

    const syncStore = useSyncStore()
    syncStore.enqueue({
      id: `slot_events:${userId.value}:${templateId}:${now}`,
      table: 'slot_events',
      operation: 'upsert',
      payload: slotEvent,
      enqueuedAt: Date.now(),
    })
    syncStore.enqueue({
      id: `mastered_archive:${userId.value}:${templateId}`,
      table: 'mastered_archive',
      operation: 'upsert',
      payload: archiveEntry,
      enqueuedAt: Date.now(),
    })
  }

  // ── Reconciliation ────────────────────────────────────────────────────────
  //
  // CLIENT ROLE — READ-ONLY
  // ───────────────────────
  // The client's reconcile() reads the ledger arrays and produces
  // lastReconcileEvents so the UI can show "streak lost" notices. It writes
  // nothing. A habit appears as lost when it has no log and no spent row in
  // freeze_ledger for yesterday — meaning it was neither logged nor protected.
  //
  // CRON ROLE (Phase 4+)
  // ─────────────────────
  // The Supabase cron (midnight IST / 18:30 UTC) checks every active habit.
  // For each habit with an active streak > 0 and no log for yesterday, with
  // freeze tokens available, it atomically writes one freeze_ledger spent row.
  // It does not write to habit_logs. The client reads the spent row on next
  // hydration or via Realtime.
  //
  // WHY THE RACE CONDITION CANNOT OCCUR
  // ─────────────────────────────────────
  // habit_logs is client-only. freeze_ledger spent rows are cron-only. They are
  // in different tables, written by different actors, for different purposes.
  // No conflict on any unique constraint is possible between them.

  /**
   * Produces lastReconcileEvents for UI display. Does not write any rows.
   *
   * A habit is "lost" when:
   *   - It is active (not paused, not mastered)
   *   - It has no log for yesterday (not logged)
   *   - It has no spent row for yesterday in freeze_ledger (not protected by cron)
   *   - Its most recent log (or added event) predates yesterday (genuinely missed,
   *     not just a habit that was added today with no history yet)
   *
   * The streak value in each event is captured via lastKnownStreak() — the streak
   * as of the last logged date, not the current streak() which returns 0 after the gap.
   */
  function reconcile(): void {
    const yesterday = yesterdayISO()

    const lostHabits = activeHabits.value.filter(h => {
      // A log row for yesterday means it was logged — not missed.
      if (hasLogForDate(h.templateId, yesterday)) return false

      // A spent row for yesterday means the cron protected it — not lost.
      const wasProtected = freezeLedger.value.some(
        r => r.template_id === h.templateId && r.date === yesterday && r.reason === 'spent'
      )
      if (wasProtected) return false

      // Confirm the habit has genuinely been in the slot long enough to miss a day.
      const logs = habitLogs.value
        .filter(l => l.template_id === h.templateId)
        .sort((a, b) => (a.date < b.date ? 1 : -1))
      const lastDate = logs[0]?.date ?? null

      if (lastDate === null) {
        // Never logged — only missed if the habit was added before yesterday.
        const latestAdded = [...slotEvents.value]
          .filter(e => e.template_id === h.templateId && e.event === 'added')
          .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0]
        if (!latestAdded) return false
        return latestAdded.created_at.slice(0, 10) < yesterday
      }

      return lastDate < yesterday
    })

    lastReconcileEvents.value = lostHabits.map(h => ({
      type: 'lost' as const,
      templateId: h.templateId,
      // lastKnownStreak captures the streak as of the last logged date.
      // streak() would return 0 here because the gap has already formed.
      streak: lastKnownStreak(h.templateId),
    }))
  }

  /** Clear reconcile events. Called when allLoggedToday becomes true. */
  function clearReconcileEvents(): void {
    lastReconcileEvents.value = []
  }

  // ── Hydration (Phase 4) ───────────────────────────────────────────────────

  /**
   * Pull all four ledger tables from Supabase and union-merge into local arrays.
   *
   * Union merge rule (same for all four tables):
   *   - Server rows not present locally are appended.
   *   - Local rows are never removed (local intent is preserved).
   *   - forceRemote has no effect on ledger tables — it's always union merge,
   *     because ledger rows are immutable facts, not mutable state.
   *
   * Pull order is parallel — all four tables are independent.
   * After this returns, the caller should call reconcile().
   *
   * Called by:
   *   - AuthView.runHydration()  (cold start, forceRemote = false)
   *   - App.vue reconnect callback  (reconnect, forceRemote = true — no-op for ledgers)
   */
  async function hydrateFromSupabase(newUserId: string, _forceRemote = false): Promise<void> {
    userId.value = newUserId

    const [logsRes, freezeRes, slotsRes, archiveRes] = await Promise.all([
      supabase.from('habit_logs').select('*').eq('user_id', newUserId),
      supabase.from('freeze_ledger').select('*').eq('user_id', newUserId),
      supabase.from('slot_events').select('*').eq('user_id', newUserId),
      supabase.from('mastered_archive').select('*').eq('user_id', newUserId),
    ])

    if (logsRes.error)    throw logsRes.error
    if (freezeRes.error)  throw freezeRes.error
    if (slotsRes.error)   throw slotsRes.error
    if (archiveRes.error) throw archiveRes.error

    // Union merge — append server rows not already present locally.
    // Dedup key per table mirrors the unique constraint in Supabase.

    const localLogKeys = new Set(habitLogs.value.map(l => `${l.template_id}:${l.date}`))
    for (const row of (logsRes.data as HabitLog[])) {
      if (!localLogKeys.has(`${row.template_id}:${row.date}`)) {
        habitLogs.value.push(row)
      }
    }

    const localFreezeKeys = new Set(
      freezeLedger.value.map(r => `${r.template_id}:${r.date}:${r.reason}`)
    )
    for (const row of (freezeRes.data as FreezeLedgerRow[])) {
      if (!localFreezeKeys.has(`${row.template_id}:${row.date}:${row.reason}`)) {
        freezeLedger.value.push(row)
      }
    }

    const localSlotKeys = new Set(
      slotEvents.value.map(e => `${e.template_id}:${e.created_at}`)
    )
    for (const row of (slotsRes.data as SlotEvent[])) {
      if (!localSlotKeys.has(`${row.template_id}:${row.created_at}`)) {
        slotEvents.value.push(row)
      }
    }

    const localArchiveKeys = new Set(masteredArchive.value.map(m => m.template_id))
    for (const row of (archiveRes.data as MasteredEntry[])) {
      if (!localArchiveKeys.has(row.template_id)) {
        masteredArchive.value.push(row)
      }
    }
  }

  // ── Phase 5: Realtime merge handlers ─────────────────────────────────────
  //
  // Called by sync.ts Realtime listeners when the server emits an INSERT.
  // Each function deduplicates against the local array before appending —
  // the same row may have already arrived via hydrateFromSupabase(), so a
  // duplicate check is always necessary.
  //
  // These are the ONLY entry points for server-push data. All other writes
  // go through the action functions (logHabit, addHabit, etc.) which enqueue
  // locally and let drain() push to Supabase.

  /** Merge a habit_logs INSERT from Realtime. Dedup key: (template_id, date). */
  function mergeHabitLog(row: HabitLog): void {
    const exists = habitLogs.value.some(
      l => l.template_id === row.template_id && l.date === row.date,
    )
    if (!exists) habitLogs.value.push(row)
  }

  /** Merge a freeze_ledger INSERT from Realtime. Dedup key: (template_id, date, reason). */
  function mergeFreezeLedgerRow(row: FreezeLedgerRow): void {
    const exists = freezeLedger.value.some(
      r => r.template_id === row.template_id && r.date === row.date && r.reason === row.reason,
    )
    if (!exists) freezeLedger.value.push(row)
  }

  /** Merge a slot_events INSERT from Realtime. Dedup key: (template_id, created_at). */
  function mergeSlotEvent(row: SlotEvent): void {
    const exists = slotEvents.value.some(
      e => e.template_id === row.template_id && e.created_at === row.created_at,
    )
    if (!exists) slotEvents.value.push(row)
  }

  /** Merge a mastered_archive INSERT from Realtime. Dedup key: template_id. */
  function mergeMasteredArchiveRow(row: MasteredEntry): void {
    const exists = masteredArchive.value.some(m => m.template_id === row.template_id)
    if (!exists) masteredArchive.value.push(row)
  }

  return {
    // Ledger arrays (local database — persist targets)
    habitLogs,
    freezeLedger,
    slotEvents,
    masteredArchive,
    lastReconcileEvents,
    userId,

    // Derived habit lists
    activeHabits,
    pausedHabits,
    masteredHabits,
    unloggedToday,

    // Derived Sets for HabitLibrary membership checks
    activeTemplateIds,
    pausedTemplateIds,
    masteredTemplateIds,
    masteredSlotTemplateIds,

    // Derived scalars
    freezeCount,
    daysToNextFreeze,
    daysToNextMastery,
    allLoggedToday,
    usedSlots,

    // Per-template derived functions
    isLoggedToday,
    isMastered,
    streak,

    // Actions
    addHabit,
    removeHabit,
    pauseHabit,
    resumeHabit,
    swapHabit,
    logHabit,
    retireHabit,
    reconcile,
    clearReconcileEvents,
    hydrateFromSupabase,

    // Phase 5: Realtime merge handlers (called by sync.ts channel listeners)
    mergeHabitLog,
    mergeFreezeLedgerRow,
    mergeSlotEvent,
    mergeMasteredArchiveRow,

    MAX_SLOTS,
  }
}, {
  persist: {
    // Ledger arrays only. Derived values recompute from them on every access.
    // lastReconcileEvents is session-scoped — not persisted.
    pick: ['habitLogs', 'freezeLedger', 'slotEvents', 'masteredArchive'],
  },
})
