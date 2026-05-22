export interface QuestionOption {
  label: string;
  points: number;
}

export interface Question {
  id: string;
  text: string;
  whyItMatters: string;
  options: QuestionOption[];
}

export interface SectionMeta {
  id: string;
  label: string;
  icon: string;
  description: string;
  maxRaw: number; // max sum of raw points (e.g. 7 questions × 5 = 35)
  scaledMax: number; // how many of the 100 total marks this section is worth
}

export interface NewsfeedItem {
  headline: string;
  source: string;
  link: string;
  date: string;
}

export interface ClockModule {
  timestamp?: string;
  labels?: string[];
  unit_labels?: string[];
  initial?: number;
  rate?: number;
  resolution?: number;
  newsfeed?: NewsfeedItem[];
}

export interface Lifeline {
  key: string;
  label: string;
  prefix: string;
  unit: string;
  scale: number;
  initial: number;
  rate: number;
  origin: Date;
  resolution: number;
}

export interface ParsedUnit {
  prefix: string;
  unit: string;
  scale: number;
}

export interface ClockDisplay {
  years: string;
  days: string;
  hours: string;
  mins: string;
  secs: string;
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type SectionId = "transport" | "food" | "energy" | "consumption" | "waste" | "water" | "digital";

export interface BadgeTaglines {
  /** Fallback when no weak sections exist or a focused key is missing. */
  default: string;
  /** Exactly one section below the weak threshold — reference it by name. */
  focused: Partial<Record<SectionId, string>>;
  /** Exactly two sections below the weak threshold. */
  split: string;
  /** Three or more sections below the weak threshold. */
  broad: string;
}

export interface Badge {
  id: string;
  label: string;
  /** Inclusive lower bound of overall score (out of 100) */
  minScore: number;
  /** Inclusive upper bound */
  maxScore: number;
  taglines: BadgeTaglines;
}

// ─── SDG ──────────────────────────────────────────────────────────────────────

export interface SDG {
  /** e.g. 'sdg-6' */
  id: string;
  /** e.g. 6 */
  number: number;
  name: string;
  /** Section ids that contribute to this goal */
  sectionIds: string[];
}

/** View-model produced by buildSdgChips — an SDG paired with its worst-performing colour. */
export interface SdgChip {
  sdg: SDG;
  color: string;
}

// ─── Mastery constants ────────────────────────────────────────────────────────

/** Maximum number of habit slots a user can fill simultaneously. */
export const MAX_SLOTS = 3;

/** Number of consecutive Yes logs required to earn a freeze token. */
export const FREEZE_MILESTONE = 22;

/** Number of consecutive Yes logs required to master a habit. */
export const MASTERY_MILESTONE = 66;

// ─── Insights ─────────────────────────────────────────────────────────────────

export type PerformanceTier = "low" | "mid";

export interface Tip {
  icon: string; // mdi icon string
  text: string;
}

export interface QuestionInsight {
  sectionId: string;
  questionId: string; // 'q1', 'q2', etc. — must match store keys
  score: 1 | 2 | 3 | 4 | 5;
  icon: string;
  text: string;
  /**
   * When true, this question has no coverable habit. The insight still renders
   * in the Reflections panel but is excluded from habit recommendation slots.
   */
  noHabit?: boolean;
}

export interface PunchyFrame {
  weakSections: string[];
  strongSections: string[];
  line: string;
}

// ─── Mastery ──────────────────────────────────────────────────────────────────

export interface HabitTemplate {
  /** Unique habit identifier */
  id: string;
  covers: Array<{ sectionId: string; questionId: string }>;
  sectionId: string;
  name: string;
  icon: string;
  iconOutline: string;
  prompt: string;
  when: string;
  instruction: string;
}

export interface UserHabit {
  id: string;
  templateId: string;
  name: string;
  icon: string;
  iconOutline: string;
  sectionId: string;
  prompt: string;
  when: string;
  instruction: string;
  streak: number;
  lastLoggedDate: string | null;
  isPaused: boolean;
  freezeUsed: boolean;
  isMastered: boolean;
}

// ─── Mastery store events & archive ──────────────────────────────────────────

export type ReconcileEvent =
  | { type: "frozen"; habitId: string; habitName: string; streak: number }
  | { type: "lost"; habitId: string; habitName: string; streak: number };

export type MasteredArchiveEntry = {
  templateId: string;
  name: string;
  icon: string;
};

// ─── Assessment store ─────────────────────────────────────────────────────────

export type SectionAnswers = Record<string, number>;

export interface AssessmentState {
  answers: Partial<Record<string, SectionAnswers>>;
  completedAt: Partial<Record<string, number>>;
  activeTab: string;
  recommendedHabitIds: string[];
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationOptions {
  message: string;
  color?: "success" | "error" | "info" | "warning";
  timeout?: number;
}

// ─── PWA ──────────────────────────────────────────────────────────────────────

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

// ─── Sorted question ──────────────────────────────────────────────────────────

export interface SortedQuestion {
  sectionId: string;
  questionId: string;
  score: 1 | 2 | 3 | 4 | 5;
}

// ─── Streak reconciler ────────────────────────────────────────────────────────

export interface ReconcileResult {
  events: ReconcileEvent[];
  newFreezeCount: number;
}

// ─── Habit lifecycle ──────────────────────────────────────────────────────────

export interface LogResult {
  freezeEarned: boolean;
  mastered: boolean;
}

// ─── Component view models ────────────────────────────────────────────────────

export interface HabitPanelItem {
  key: string;
  icon: string;
  iconColor: string;
  name: string;
  chip?: { color: string; icon: string; label: string };
}

export type QuestionId = string;

// ─── Sync ─────────────────────────────────────────────────────────────────────

export interface SyncQueueItem {
  /** Dedup key: 'table:pk1:pk2' for upsert/delete, 'slot_rpc:fn:userId:templateId' for rpc */
  id: string;
  /**
   * 'upsert'  — ledger tables (habit_logs, freeze_ledger, mastered_archive).
   *             Uses ignoreDuplicates=true so conflicts on append-only tables are no-ops.
   * 'delete'  — not currently used.
   * 'rpc'     — SECURITY DEFINER RPC call. fn must be set. table is unused.
   *             Used for all habit_slots and habit_pause_events writes (slot_add,
   *             slot_pause, slot_resume, slot_remove, slot_retire).
   */
  operation: 'upsert' | 'delete' | 'rpc';
  /** Supabase table name — required for upsert/delete, unused for rpc. */
  table?: string;
  /** RPC function name — required when operation = 'rpc'. */
  fn?: string;
  payload: Record<string, unknown>;
  enqueuedAt: number;
}

export type SyncStatus = "offline" | "hydrating" | "syncing" | "synced";

// ─── Ledger types ─────────────────────────────────────────────────────────────

/** Maximum freeze tokens a user can hold from milestone grants. */
export const FREEZE_CAP = 3;

/** Minimum freeze balance (debt floor — reconciliation may go negative). */
export const DEBT_FLOOR = -2;

/**
 * One logged day for one habit. Unique on (user_id, template_id, date).
 * Client-only. The cron never writes here.
 */
export interface HabitLog {
  user_id: string;
  template_id: string;
  /** YYYY-MM-DD (IST) */
  date: string;
  value: 'yes' | 'no';
  created_at: string;
}

/**
 * One freeze token event. Append-only; never updated or deleted.
 * reason='spent' is CRON ONLY — the client never writes spent rows.
 */
export interface FreezeLedgerRow {
  user_id: string;
  template_id: string;
  /** +1 for earned, -1 for spent */
  delta: number;
  reason: 'milestone' | 'mastery' | 'spent';
  /** YYYY-MM-DD */
  date: string;
  created_at: string;
}

/**
 * Server-authoritative habit slot state. One row per habit the user holds
 * in any non-library state (active or paused).
 *
 * status:
 *   'active' — occupies one of the three active slots; counts toward the cap.
 *   'paused' — slot held, streak preserved, excluded from daily log flow.
 *              Does NOT count toward the cap.
 *
 * created_at — set once at INSERT by DEFAULT now(). Never modified.
 *              Streak boundary: the streak walker ignores all logs before this date.
 *              No client code may supply or modify it (R7).
 *
 * All writes go through SECURITY DEFINER RPCs. Client RLS is SELECT-only (R1).
 */
export interface HabitSlot {
  user_id: string;
  template_id: string;
  status: 'active' | 'paused';
  created_at: string;
}

/**
 * One pause window per habit. Used by the streak walker to skip pause gaps.
 *
 * paused_at  — when slot_pause ran (window opens).
 * resumed_at — when slot_resume / slot_remove / slot_retire ran.
 *              null = window still open (habit is currently paused).
 *
 * At most one open window (resumed_at IS NULL) per (user_id, template_id) at
 * any time. Enforced by slot_pause only operating on status = 'active' rows.
 *
 * All writes go through SECURITY DEFINER RPCs. Client RLS is SELECT-only (R1).
 */
export interface HabitPauseEvent {
  user_id: string;
  template_id: string;
  paused_at: string;
  resumed_at: string | null;
}

/** A habit that has been mastered and retired from slots. Written once via slot_retire. */
export interface MasteredEntry {
  user_id: string;
  template_id: string;
  created_at: string;
}

/** Session-scoped event produced by reconcile(). Never persisted. */
export type LedgerReconcileEvent = { type: 'lost'; templateId: string; streak: number };
