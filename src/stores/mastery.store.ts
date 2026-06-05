// Pinia store -- habit mastery state, streak calculations, freeze ledger, and sync queue

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { HABIT_TEMPLATES } from '@/data/habits'
import { todayISO, yesterdayISO } from '@/utils/habit-date'
import type {
  HabitTemplate,
  UserHabit,
  HabitLog,
  FreezeLedgerRow,
  HabitSlot,
  HabitPauseEvent,
  MasteredEntry,
  LedgerReconcileEvent,
} from '@/types/app.types'
import {
  MAX_SLOTS,
  FREEZE_MILESTONE,
  MASTERY_MILESTONE,
  FREEZE_CAP,
  DEBT_FLOOR,
} from '@/types/app.types'
import { useSyncStore } from '@/stores/sync.store'
import { supabase } from '@/services/supabase.service'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isoNow(): string {
  return new Date().toISOString()
}

function prevDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

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

export const useMasteryStore = defineStore(
  'mastery',
  () => {
    // ─── State ───────────────────────────────────────────────────────────────
    //
    // habit_logs and freeze_ledger are append-only; rows are pushed, never spliced.
    // habit_slots and pause_events are mutable; rows may be updated or removed.
    // All five are persisted to localStorage as the local cache between sessions.

    const habitLogs = ref<HabitLog[]>([])
    const freezeLedger = ref<FreezeLedgerRow[]>([])
    const habitSlots = ref<HabitSlot[]>([])
    const pauseEvents = ref<HabitPauseEvent[]>([])
    const masteredArchive = ref<MasteredEntry[]>([])

    // Session-scoped. Holds the outcome of the last reconcile() for UI notices.
    // Not persisted. Cleared when allLoggedToday fires.
    const lastReconcileEvents = ref<LedgerReconcileEvent[]>([])

    // Populated from the Supabase auth session during hydrateFromSupabase().
    const userId = ref<string>('')

    // ─── Helpers ─────────────────────────────────────────────────────────────

    function hasLogForDate(templateId: string, date: string): boolean {
      return habitLogs.value.some((l) => l.template_id === templateId && l.date === date)
    }

    // R14 -- prior-cycle isolation: pause windows whose paused_at predates
    // slot.created_at belong to a previous lifecycle and are ignored, ensuring
    // re-adding a habit is a clean slate even if old windows survive locally.
    //
    // A window covers date when: paused_at <= end of day AND (resumed_at is null
    // OR resumed_at > start of day).
    function isPausedOnDate(templateId: string, date: string): boolean {
      const slot = habitSlots.value.find((s) => s.template_id === templateId)
      if (!slot) return false
      const boundary = slot.created_at
      const endOfDay = date + 'T23:59:59.999Z'
      const startOfDay = date + 'T00:00:00.000Z'

      return pauseEvents.value.some((e) => {
        if (e.template_id !== templateId) return false
        if (e.paused_at < boundary) return false // R14: prior-cycle window
        if (e.paused_at > endOfDay) return false // window not yet opened
        return e.resumed_at === null || e.resumed_at > startOfDay
      })
    }

    // ─── Computed ────────────────────────────────────────────────────────────

    // Boundary: slot.created_at, the moment the current lifecycle started.
    // Logs before that date are invisible to the walker.
    //
    // Walk rules, evaluated in order for each date:
    //   1. Log exists, value 'yes'                -> count++, continue
    //   2. Log exists, value 'no'                 -> continue (chain preserved, not counted)
    //   3. No log, date is today AND not anchored -> skip (not yet logged, transparent)
    //   4. No log, isPausedOnDate returns true    -> skip (pause gap, transparent)
    //   5. No log, spent row in freeze_ledger     -> skip (cron protected this gap)
    //   6. No log, nothing                        -> STOP (unprotected gap, streak ends)
    function streak(templateId: string, asOf?: string): number {
      const slot = habitSlots.value.find((s) => s.template_id === templateId)
      if (!slot) return 0

      const boundaryDate = slot.created_at.slice(0, 10)

      const logMap = new Map<string, 'yes' | 'no'>()
      for (const l of habitLogs.value) {
        if (l.template_id === templateId && l.date >= boundaryDate) {
          logMap.set(l.date, l.value)
        }
      }

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
          if (value === 'yes') count++
          dateStr = prevDate(dateStr)
          continue
        }

        if (dateStr === referenceDate && !isAnchored) {
          dateStr = prevDate(dateStr)
          continue
        }

        if (isPausedOnDate(templateId, dateStr)) {
          dateStr = prevDate(dateStr)
          continue
        }

        if (spentSet.has(dateStr)) {
          dateStr = prevDate(dateStr)
          continue
        }

        break
      }

      return count
    }

    // Anchors the walk to the most recent logged date so the pre-loss count is
    // returned even after the gap has already formed (streak() would return 0).
    function lastKnownStreak(templateId: string): number {
      const lastLog = [...habitLogs.value]
        .filter((l) => l.template_id === templateId)
        .sort((a, b) => (a.date < b.date ? 1 : -1))[0]
      if (!lastLog) return 0
      return streak(templateId, lastLog.date)
    }

    // Net freeze token balance.
    // Spent rows are only effective when no habit_log exists for the same
    // (template_id, date); a late yes/no implicitly refunds the token.
    // Balance is floored at DEBT_FLOOR.
    const freezeCount = computed((): number => {
      const raw = freezeLedger.value.reduce((sum, row) => {
        if (row.reason !== 'spent') return sum + row.delta
        const logArrived = habitLogs.value.some(
          (l) => l.template_id === row.template_id && l.date === row.date,
        )
        return logArrived ? sum : sum + row.delta
      }, 0)
      return Math.max(raw, DEBT_FLOOR)
    })

    function isLoggedToday(templateIdOrHabit: string | { templateId: string }): boolean {
      const tId =
        typeof templateIdOrHabit === 'string' ? templateIdOrHabit : templateIdOrHabit.templateId
      return hasLogForDate(tId, todayISO())
    }

    function isMastered(templateId: string): boolean {
      if (masteredArchive.value.some((m) => m.template_id === templateId)) return true
      return streak(templateId) === MASTERY_MILESTONE
    }

    // Only true if the cron spent a token yesterday, no log arrived for that date
    // (a late log makes the spend a no-op), and the streak is still alive.
    function isFreezeUsed(templateId: string): boolean {
      if (streak(templateId) === 0) return false
      const yesterday = yesterdayISO()
      const wasProtected = freezeLedger.value.some(
        (r) => r.template_id === templateId && r.date === yesterday && r.reason === 'spent',
      )
      if (!wasProtected) return false
      if (hasLogForDate(templateId, todayISO())) return false
      return !habitLogs.value.some((l) => l.template_id === templateId && l.date === yesterday)
    }

    // All lists read directly from habitSlots.status; no event-scanning needed.

    const activeHabits = computed((): UserHabit[] => {
      const archivedIds = new Set(masteredArchive.value.map((m) => m.template_id))
      const result: UserHabit[] = []
      for (const slot of habitSlots.value) {
        if (slot.status !== 'active') continue
        if (archivedIds.has(slot.template_id)) continue
        const s = streak(slot.template_id)
        if (s === MASTERY_MILESTONE) continue
        const template = HABIT_TEMPLATES.find((t) => t.id === slot.template_id)
        if (!template) continue
        result.push(buildUserHabit(template, s, false, isFreezeUsed(slot.template_id)))
      }
      return result
    })

    const pausedHabits = computed((): UserHabit[] => {
      const pausedAt = new Map<string, string>()
      for (const e of pauseEvents.value) {
        if (e.resumed_at !== null) continue
        const prev = pausedAt.get(e.template_id)
        if (!prev || e.paused_at > prev) pausedAt.set(e.template_id, e.paused_at)
      }

      const result: UserHabit[] = []
      for (const slot of habitSlots.value) {
        if (slot.status !== 'paused') continue
        const template = HABIT_TEMPLATES.find((t) => t.id === slot.template_id)
        if (!template) continue
        result.push(
          buildUserHabit(template, streak(slot.template_id), false, isFreezeUsed(slot.template_id)),
        )
      }

      // ISO strings sort lexicographically so localeCompare is correct here.
      result.sort((a, b) => {
        const aTime = pausedAt.get(a.templateId) ?? ''
        const bTime = pausedAt.get(b.templateId) ?? ''
        return bTime.localeCompare(aTime)
      })

      return result
    })

    const masteredHabits = computed((): UserHabit[] => {
      const archivedIds = new Set(masteredArchive.value.map((m) => m.template_id))
      const result: UserHabit[] = []
      for (const slot of habitSlots.value) {
        if (slot.status !== 'active') continue
        if (archivedIds.has(slot.template_id)) continue
        if (streak(slot.template_id) !== MASTERY_MILESTONE) continue
        const template = HABIT_TEMPLATES.find((t) => t.id === slot.template_id)
        if (!template) continue
        result.push(buildUserHabit(template, MASTERY_MILESTONE, true, false))
      }
      return result
    })

    const allLoggedToday = computed((): boolean => {
      if (activeHabits.value.length === 0) return false
      return activeHabits.value.every((h) => isLoggedToday(h.templateId))
    })

    const unloggedToday = computed((): UserHabit[] =>
      activeHabits.value.filter((h) => !isLoggedToday(h.templateId)),
    )

    const daysToNextFreeze = computed((): number | null => {
      if (activeHabits.value.length === 0) return null
      const values = activeHabits.value.map((h) => {
        const s = streak(h.templateId)
        return FREEZE_MILESTONE - (s % FREEZE_MILESTONE)
      })
      return Math.min(...values)
    })

    const daysToNextMastery = computed((): number | null => {
      const qualifying = activeHabits.value.filter((h) => streak(h.templateId) >= 1)
      if (qualifying.length === 0) return null
      const values = qualifying.map((h) => {
        const s = streak(h.templateId)
        return MASTERY_MILESTONE - (s % MASTERY_MILESTONE)
      })
      return Math.min(...values)
    })

    const activeTemplateIds = computed(
      (): Set<string> => new Set(activeHabits.value.map((h) => h.templateId)),
    )
    const pausedTemplateIds = computed(
      (): Set<string> => new Set(pausedHabits.value.map((h) => h.templateId)),
    )

    const masteredTemplateIds = computed((): Set<string> => {
      const s = new Set(masteredArchive.value.map((m) => m.template_id))
      for (const h of masteredHabits.value) s.add(h.templateId)
      return s
    })

    const masteredSlotTemplateIds = computed(
      (): Set<string> => new Set(masteredHabits.value.map((h) => h.templateId)),
    )

    // Paused slots excluded; R3 says only active slots count toward the cap.
    const usedSlots = computed(
      (): number => habitSlots.value.filter((s) => s.status === 'active').length,
    )

    // ─── Actions ─────────────────────────────────────────────────────────────
    //
    // Each action:
    //   1. Updates local arrays optimistically (immediate UI feedback).
    //   2. Enqueues an RPC item in the sync queue.
    //
    // habit_slots and habit_pause_events are updated locally first, then the
    // corresponding SECURITY DEFINER RPC is enqueued. If the RPC fails with
    // slot_cap_exceeded, sync.ts calls the capRejectionCallback which re-hydrates
    // slot state from Supabase and reconciles.

    function addHabit(template: HabitTemplate): void {
      if (activeTemplateIds.value.has(template.id) || pausedTemplateIds.value.has(template.id))
        return
      const now = isoNow()
      habitSlots.value.push({
        user_id: userId.value,
        template_id: template.id,
        status: 'active',
        created_at: now,
      })
      useSyncStore().enqueue({
        id: `slot_add:${userId.value}:${template.id}`,
        operation: 'rpc',
        fn: 'slot_add',
        payload: { p_user_id: userId.value, p_template_id: template.id },
        enqueuedAt: Date.now(),
      })
    }

    function pauseHabit(templateId: string): void {
      const idx = habitSlots.value.findIndex((s) => s.template_id === templateId)
      if (idx === -1) return
      // Guard: slot must be active -- prevents P0002 from slot_pause RPC if already
      // paused (e.g. multi-tab race where Realtime update hasn't arrived yet).
      if (habitSlots.value[idx]!.status !== 'active') return
      habitSlots.value[idx] = { ...habitSlots.value[idx]!, status: 'paused' }
      const now = isoNow()
      pauseEvents.value.push({
        user_id: userId.value,
        template_id: templateId,
        paused_at: now,
        resumed_at: null,
      })
      useSyncStore().enqueue({
        id: `slot_pause:${userId.value}:${templateId}:${now}`,
        operation: 'rpc',
        fn: 'slot_pause',
        payload: { p_user_id: userId.value, p_template_id: templateId },
        enqueuedAt: Date.now(),
      })
    }

    // Cap-gated; slot_resume fires enforce_slot_cap on the server.
    function resumeHabit(templateId: string): void {
      const idx = habitSlots.value.findIndex((s) => s.template_id === templateId)
      if (idx === -1) return
      habitSlots.value[idx] = { ...habitSlots.value[idx]!, status: 'active' }
      const now = isoNow()
      const openIdx = pauseEvents.value.findIndex(
        (e) => e.template_id === templateId && e.resumed_at === null,
      )
      if (openIdx !== -1) {
        pauseEvents.value[openIdx] = { ...pauseEvents.value[openIdx]!, resumed_at: now }
      }
      useSyncStore().enqueue({
        id: `slot_resume:${userId.value}:${templateId}:${now}`,
        operation: 'rpc',
        fn: 'slot_resume',
        payload: { p_user_id: userId.value, p_template_id: templateId },
        enqueuedAt: Date.now(),
      })
    }

    // Clean slate: slot_add on re-add creates a new created_at, making all prior
    // logs invisible to the walker. slot_remove closes any open pause window atomically.
    function removeHabit(templateId: string): void {
      const idx = habitSlots.value.findIndex((s) => s.template_id === templateId)
      if (idx !== -1) habitSlots.value.splice(idx, 1)
      const now = isoNow()
      const openIdx = pauseEvents.value.findIndex(
        (e) => e.template_id === templateId && e.resumed_at === null,
      )
      if (openIdx !== -1) {
        pauseEvents.value[openIdx] = { ...pauseEvents.value[openIdx]!, resumed_at: now }
      }
      useSyncStore().enqueue({
        id: `slot_remove:${userId.value}:${templateId}`,
        operation: 'rpc',
        fn: 'slot_remove',
        payload: { p_user_id: userId.value, p_template_id: templateId },
        enqueuedAt: Date.now(),
      })
    }

    // Idempotent; hasLogForDate guard + unique DB constraint prevent double-logging.
    // 'no' preserves the chain without counting toward the 66-day threshold.
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
        const s = streak(templateId) // recalculate after push

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

    // slot_retire RPC handles atomically: close pause window + delete slot + insert archive.
    function retireHabit(templateId: string): void {
      const idx = habitSlots.value.findIndex((s) => s.template_id === templateId)
      if (idx !== -1) habitSlots.value.splice(idx, 1)
      const now = isoNow()
      const openIdx = pauseEvents.value.findIndex(
        (e) => e.template_id === templateId && e.resumed_at === null,
      )
      if (openIdx !== -1) {
        pauseEvents.value[openIdx] = { ...pauseEvents.value[openIdx]!, resumed_at: now }
      }
      // Write masteredArchive locally so masteredTemplateIds updates immediately.
      const archiveEntry: MasteredEntry = {
        user_id: userId.value,
        template_id: templateId,
        created_at: now,
      }
      masteredArchive.value.push(archiveEntry)

      // Enqueue RPC; slot_retire handles the DB side atomically.
      // masteredArchive is also written via direct upsert so the local row
      // survives if the RPC fires first and Realtime returns the archive row.
      const syncStore = useSyncStore()
      syncStore.enqueue({
        id: `slot_retire:${userId.value}:${templateId}`,
        operation: 'rpc',
        fn: 'slot_retire',
        payload: { p_user_id: userId.value, p_template_id: templateId },
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

    // ─── Utils ───────────────────────────────────────────────────────────────
    //
    // reconcile() is read-only -- it surfaces lastReconcileEvents for UI "streak
    // lost" notices. A habit added today with no history is not considered missed.

    function reconcile(): void {
      const yesterday = yesterdayISO()

      const lostHabits = activeHabits.value.filter((h) => {
        if (hasLogForDate(h.templateId, yesterday)) return false

        const wasProtected = freezeLedger.value.some(
          (r) => r.template_id === h.templateId && r.date === yesterday && r.reason === 'spent',
        )
        if (wasProtected) return false

        const slot = habitSlots.value.find((s) => s.template_id === h.templateId)
        if (!slot) return false
        return slot.created_at.slice(0, 10) < yesterday
      })

      lastReconcileEvents.value = lostHabits.map((h) => ({
        type: 'lost' as const,
        templateId: h.templateId,
        streak: lastKnownStreak(h.templateId),
      }))
    }

    function clearReconcileEvents(): void {
      lastReconcileEvents.value = []
    }

    // ─── Lifecycle ───────────────────────────────────────────────────────────
    //
    // habit_logs, freeze_ledger, mastered_archive: union merge (append-only,
    // local-wins; server rows not present locally are appended, local rows kept).
    //
    // habit_slots, habit_pause_events: full replace (server is authoritative;
    // all writes go through RPCs so the server always has the canonical state).
    //
    // Called by AuthView on cold start and by App.vue on reconnect.

    async function hydrateFromSupabase(newUserId: string, _forceRemote = false): Promise<void> {
      userId.value = newUserId

      const [logsRes, freezeRes, slotsRes, pauseRes, archiveRes] = await Promise.all([
        supabase.from('habit_logs').select('*').eq('user_id', newUserId),
        supabase.from('freeze_ledger').select('*').eq('user_id', newUserId),
        supabase.from('habit_slots').select('*').eq('user_id', newUserId),
        supabase.from('habit_pause_events').select('*').eq('user_id', newUserId),
        supabase.from('mastered_archive').select('*').eq('user_id', newUserId),
      ])

      if (logsRes.error) throw logsRes.error
      if (freezeRes.error) throw freezeRes.error
      if (slotsRes.error) throw slotsRes.error
      if (pauseRes.error) throw pauseRes.error
      if (archiveRes.error) throw archiveRes.error

      habitSlots.value = slotsRes.data as HabitSlot[]
      pauseEvents.value = pauseRes.data as HabitPauseEvent[]

      const localLogKeys = new Set(habitLogs.value.map((l) => `${l.template_id}:${l.date}`))
      for (const row of logsRes.data as HabitLog[]) {
        if (!localLogKeys.has(`${row.template_id}:${row.date}`)) {
          habitLogs.value.push(row)
        }
      }

      const localFreezeKeys = new Set(
        freezeLedger.value.map((r) => `${r.template_id}:${r.date}:${r.reason}`),
      )
      for (const row of freezeRes.data as FreezeLedgerRow[]) {
        if (!localFreezeKeys.has(`${row.template_id}:${row.date}:${row.reason}`)) {
          freezeLedger.value.push(row)
        }
      }

      const localArchiveKeys = new Set(masteredArchive.value.map((m) => m.template_id))
      for (const row of archiveRes.data as MasteredEntry[]) {
        if (!localArchiveKeys.has(row.template_id)) {
          masteredArchive.value.push(row)
        }
      }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    //
    // Realtime patch-in handlers called by sync.ts; habit_slots and pause_events
    // are fully replaced on UPDATE/DELETE, append-only tables accept INSERT only.

    function mergeHabitSlot(row: HabitSlot, eventType: 'INSERT' | 'UPDATE' | 'DELETE'): void {
      const idx = habitSlots.value.findIndex((s) => s.template_id === row.template_id)
      if (eventType === 'DELETE') {
        if (idx !== -1) habitSlots.value.splice(idx, 1)
      } else if (eventType === 'UPDATE') {
        if (idx !== -1) habitSlots.value[idx] = row
        else habitSlots.value.push(row)
      } else {
        // INSERT
        if (idx === -1) habitSlots.value.push(row)
      }
    }

    function mergePauseEvent(row: HabitPauseEvent, eventType: 'INSERT' | 'UPDATE'): void {
      const idx = pauseEvents.value.findIndex(
        (e) => e.template_id === row.template_id && e.paused_at === row.paused_at,
      )
      if (eventType === 'UPDATE') {
        if (idx !== -1) pauseEvents.value[idx] = row
        else pauseEvents.value.push(row)
      } else {
        // INSERT
        if (idx === -1) pauseEvents.value.push(row)
      }
    }

    function mergeHabitLog(row: HabitLog): void {
      const exists = habitLogs.value.some(
        (l) => l.template_id === row.template_id && l.date === row.date,
      )
      if (!exists) habitLogs.value.push(row)
    }

    function mergeFreezeLedgerRow(row: FreezeLedgerRow): void {
      const exists = freezeLedger.value.some(
        (r) => r.template_id === row.template_id && r.date === row.date && r.reason === row.reason,
      )
      if (!exists) freezeLedger.value.push(row)
    }

    function mergeMasteredArchiveRow(row: MasteredEntry): void {
      const exists = masteredArchive.value.some((m) => m.template_id === row.template_id)
      if (!exists) masteredArchive.value.push(row)
    }

    return {
      habitLogs,
      freezeLedger,
      habitSlots,
      pauseEvents,
      masteredArchive,
      lastReconcileEvents,
      userId,
      activeHabits,
      pausedHabits,
      masteredHabits,
      unloggedToday,
      activeTemplateIds,
      pausedTemplateIds,
      masteredTemplateIds,
      masteredSlotTemplateIds,
      freezeCount,
      daysToNextFreeze,
      daysToNextMastery,
      allLoggedToday,
      usedSlots,
      isLoggedToday,
      isMastered,
      streak,
      addHabit,
      removeHabit,
      pauseHabit,
      resumeHabit,
      logHabit,
      retireHabit,
      reconcile,
      clearReconcileEvents,
      hydrateFromSupabase,
      mergeHabitLog,
      mergeFreezeLedgerRow,
      mergeHabitSlot,
      mergePauseEvent,
      mergeMasteredArchiveRow,
      MAX_SLOTS,
    }
  },
  {
    persist: {
      pick: ['habitLogs', 'freezeLedger', 'habitSlots', 'pauseEvents', 'masteredArchive'],
    },
  },
)
