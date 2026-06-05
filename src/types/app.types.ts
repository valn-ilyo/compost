// TypeScript types and shared constants for the Compost app

export interface QuestionOption {
  label: string
  points: number
}

export interface Question {
  id: string
  text: string
  whyItMatters: string
  options: QuestionOption[]
}

export interface SectionMeta {
  id: string
  label: string
  icon: string
  description: string
  maxRaw: number // max sum of raw points (e.g. 7 questions × 5 = 35)
  scaledMax: number // how many of the 100 total marks this section is worth
}

export interface NewsfeedItem {
  headline: string
  source: string
  link: string
  date: string
}

export interface ClockModule {
  timestamp?: string
  labels?: string[]
  unit_labels?: string[]
  initial?: number
  rate?: number
  resolution?: number
  newsfeed?: NewsfeedItem[]
}

export interface Lifeline {
  key: string
  label: string
  prefix: string
  unit: string
  scale: number
  initial: number
  rate: number
  origin: Date
  resolution: number
}

export interface ParsedUnit {
  prefix: string
  unit: string
  scale: number
}

export interface ClockDisplay {
  years: string
  days: string
  hours: string
  mins: string
  secs: string
}

type SectionId = 'transport' | 'food' | 'energy' | 'consumption' | 'waste' | 'water' | 'digital'

export interface BadgeTaglines {
  default: string // fallback when no weak sections exist or a focused key is missing
  focused: Partial<Record<SectionId, string>> // exactly one section below the weak threshold -- reference by name
  split: string // exactly two sections below the weak threshold
  broad: string // three or more sections below the weak threshold
}

export interface Badge {
  id: string
  label: string
  minScore: number // inclusive lower bound of overall score (out of 100)
  maxScore: number // inclusive upper bound
  taglines: BadgeTaglines
}

export interface SDG {
  id: string // e.g. 'sdg-6'
  number: number // e.g. 6
  name: string
  sectionIds: string[] // section ids that contribute to this goal
}

export interface SdgChip {
  sdg: SDG
  color: string
}

export const MAX_SLOTS = 3
// 22 consecutive yes logs required to earn a freeze token
export const FREEZE_MILESTONE = 22
// 66 consecutive yes logs required to master a habit -- Lally et al. (2010) median for habit automaticity
export const MASTERY_MILESTONE = 66

export interface Tip {
  icon: string // mdi icon string
  text: string
}

export interface QuestionInsight {
  sectionId: string
  questionId: string // 'q1', 'q2', etc. -- must match store keys
  score: 1 | 2 | 3 | 4 | 5
  icon: string
  text: string
  noHabit?: boolean // no coverable habit -- renders in Reflections but excluded from recommendation slots
}

export interface HabitTemplate {
  id: string
  covers: Array<{ sectionId: string; questionId: string }>
  sectionId: string
  name: string
  icon: string
  iconOutline: string
  prompt: string
  when: string
  instruction: string
}

export interface UserHabit {
  id: string
  templateId: string
  name: string
  icon: string
  iconOutline: string
  sectionId: string
  prompt: string
  when: string
  instruction: string
  streak: number
  lastLoggedDate: string | null
  isPaused: boolean
  freezeUsed: boolean
  isMastered: boolean
}

export type SectionAnswers = Record<string, number>

export interface AssessmentState {
  answers: Partial<Record<string, SectionAnswers>>
  completedAt: Partial<Record<string, number>>
  activeTab: string
  recommendedHabitIds: string[]
}

export interface NotificationOptions {
  message: string
  color?: 'success' | 'error' | 'info' | 'warning'
  timeout?: number
}

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

export interface SortedQuestion {
  sectionId: string
  questionId: string
  score: 1 | 2 | 3 | 4 | 5
}

export interface HabitPanelItem {
  key: string
  icon: string
  iconColor: string
  name: string
  chip?: { color: string; icon: string; label: string }
}

export type QuestionId = string

// startRealtime() in sync.ts accepts this shape from App.vue. Passing handlers
// as callbacks avoids a circular dependency (mastery.ts already imports sync.ts).
// onHabitSlot and onPauseEvent receive the event type so the merge handler can
// distinguish INSERT, UPDATE, and DELETE without inspecting row fields.

export interface RealtimeHandlers {
  onHabitLog: (row: HabitLog) => void
  onFreezeRow: (row: FreezeLedgerRow) => void
  onHabitSlot: (row: HabitSlot, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void
  onPauseEvent: (row: HabitPauseEvent, eventType: 'INSERT' | 'UPDATE') => void
  onMasteredEntry: (row: MasteredEntry) => void
}

export interface SyncQueueItem {
  id: string // dedup key: 'table:pk1:pk2' for upsert/delete, 'slot_rpc:fn:userId:templateId' for rpc
  // 'upsert'  -- ledger tables (habit_logs, freeze_ledger, mastered_archive).
  //              Uses ignoreDuplicates=true so conflicts on append-only tables are no-ops.
  // 'delete'  -- not currently used.
  // 'rpc'     -- SECURITY DEFINER RPC call. fn must be set. table is unused.
  //              Used for all habit_slots and habit_pause_events writes (slot_add,
  //              slot_pause, slot_resume, slot_remove, slot_retire).
  operation: 'upsert' | 'delete' | 'rpc'
  table?: string // required for upsert/delete, unused for rpc
  fn?: string // required when operation = 'rpc'
  payload: Record<string, unknown>
  enqueuedAt: number
}

export type SyncStatus = 'offline' | 'hydrating' | 'syncing' | 'synced'

export const FREEZE_CAP = 3 // maximum freeze tokens a user can hold from milestone grants
// Reconciliation may push balance negative; this caps the deficit
export const DEBT_FLOOR = -2

// One logged day for one habit. Unique on (user_id, template_id, date).
// Client-only -- the cron never writes here.
export interface HabitLog {
  [key: string]: unknown
  user_id: string
  template_id: string
  date: string // YYYY-MM-DD (IST)
  value: 'yes' | 'no'
  created_at: string
}

// Append-only freeze token event, never updated or deleted.
// reason='spent' is CRON ONLY -- the client never writes spent rows.
export interface FreezeLedgerRow {
  [key: string]: unknown
  user_id: string
  template_id: string
  delta: number // +1 for earned, -1 for spent
  reason: 'milestone' | 'mastery' | 'spent'
  date: string // YYYY-MM-DD
  created_at: string
}

// Server-authoritative habit slot state. One row per habit the user holds
// in any non-library state (active or paused).
//
// status:
//   'active' -- occupies one of the three active slots; counts toward the cap.
//   'paused' -- slot held, streak preserved, excluded from daily log flow.
//               Does NOT count toward the cap.
//
// created_at -- set once at INSERT by DEFAULT now(). Never modified.
//               Streak boundary: the streak walker ignores all logs before this date.
//               No client code may supply or modify it (R7).
//
// All writes go through SECURITY DEFINER RPCs. Client RLS is SELECT-only (R1).
export interface HabitSlot {
  [key: string]: unknown
  user_id: string
  template_id: string
  status: 'active' | 'paused'
  created_at: string
}

// One pause window per habit. Used by the streak walker to skip pause gaps.
//
// paused_at  -- when slot_pause ran (window opens).
// resumed_at -- when slot_resume / slot_remove / slot_retire ran.
//               null = window still open (habit is currently paused).
//
// At most one open window (resumed_at IS NULL) per (user_id, template_id) at
// any time. Enforced by slot_pause only operating on status = 'active' rows.
//
// All writes go through SECURITY DEFINER RPCs. Client RLS is SELECT-only (R1).
export interface HabitPauseEvent {
  [key: string]: unknown
  user_id: string
  template_id: string
  paused_at: string
  resumed_at: string | null
}

// Written once via slot_retire, never updated or deleted.
export interface MasteredEntry {
  [key: string]: unknown
  user_id: string
  template_id: string
  created_at: string
}

// Session-scoped, never persisted -- produced by reconcile().
export type LedgerReconcileEvent = { type: 'lost'; templateId: string; streak: number }
