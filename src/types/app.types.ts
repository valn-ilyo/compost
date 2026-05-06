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
  scale: number; // ← new
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
  icon: string; // you assign
  text: string; // from research v2
  /**
   * When true, this question has no coverable habit (e.g. commute_distance is a
   * fixed fact, not a repeatable behaviour). The insight still renders in the
   * Reflections panel but is excluded from habit recommendation slots so it
   * never silently burns an actionable pick.
   */
  noHabit?: boolean;
}

/**
 * A punchy 1–2 line framing that opens the insights block.
 * Matched when ALL sectionIds in the pattern appear in the user's
 * low-performing sections.
 */
export interface PunchyFrame {
  /** The pattern that must match — all these sections must be low */
  weakSections: string[];
  /** The pattern that must match — all these sections must be high */
  strongSections: string[];
  line: string;
}

// ─── Mastery ──────────────────────────────────────────────────────────────────

/**
 * A static habit entry from the library.
 * Content is placeholder for now — real researched data replaces these later.
 */
export interface HabitTemplate {
  /** Unique habit identifier — no longer mirrors a question id */
  id: string;
  /**
   * The assessment questions this habit covers.
   * A habit may cover one question, multiple questions in the same section,
   * or questions across different sections (cross-section shared habits).
   * Used to drive recommendations: the habit surfaces when any of its linked
   * questions appear in the user's low-scoring slots.
   */
  covers: Array<{ sectionId: string; questionId: string }>;
  /**
   * Primary section for display grouping in the habit library.
   * For cross-section habits, use the section whose question has the
   * greater footprint relevance (or the first listed cover).
   */
  sectionId: string;
  /** Display name shown in the library and on the habit card — fixed regardless of score */
  name: string;
  /** MDI icon identifier for this specific habit — filled, used when active */
  icon: string;
  /**
   * Outline variant of the icon — used in the library (available/paused/recommended).
   * Equals `icon` for the handful of MDI icons that have no outline counterpart.
   */
  iconOutline: string;
  /** Daily yes/no prompt shown in the check-in sheet */
  prompt: string;
  /** The cue or trigger for the habit — when to do it. Shown in Growth Space and Stats. */
  when: string;
  /** Onboarding instruction shown in Growth Space and Stats. */
  instruction: string;
}

/**
 * A habit slot owned by the user — either active or paused.
 * Derived from a HabitTemplate when the user adds it; persisted in the mastery store.
 */
export interface UserHabit {
  /** Runtime id (Date.now() string) — not a template id */
  id: string;
  /** Points back to the source HabitTemplate — used to prevent duplicate adds */
  templateId: string;
  /** Copied from template at add-time so template edits don't affect existing user habits */
  name: string;
  /** MDI icon — filled variant, copied from template at add-time */
  icon: string;
  /** MDI icon — outline variant, copied from template at add-time */
  iconOutline: string;
  sectionId: string;
  prompt: string;
  /** Copied from template — shown in Growth Space and Stats screen */
  when: string;
  /** Copied from template — shown in Growth Space and Stats screen */
  instruction: string;
  /** Current consecutive-day streak */
  streak: number;
  /**
   * ISO date string (YYYY-MM-DD) of the last day this habit was logged, or null if never.
   * Used to derive isLoggedToday without storing a separate boolean.
   */
  lastLoggedDate: string | null;
  /** True when the user has paused this habit — slot is held, streak is preserved */
  isPaused: boolean;
  /**
   * True when a streak freeze was auto-applied yesterday.
   * Shown as a one-day notice on the card, then cleared on the next render cycle.
   */
  freezeUsed: boolean;
  /**
   * True when the habit has reached the MASTERY_MILESTONE-day mastery milestone.
   * Mastered habits cannot be logged and are excluded from activeHabits computed,
   * but still occupy a slot until the user explicitly retires them.
   */
  isMastered: boolean;
}

// ─── Mastery store events & archive ──────────────────────────────────────────

/**
 * A single event produced by reconcileStreaks describing what happened to one
 * habit when the user missed a day. Persisted so they survive a page refresh.
 */
export type ReconcileEvent =
  | { type: "frozen"; habitId: string; habitName: string; streak: number }
  | { type: "lost"; habitId: string; habitName: string; streak: number };

/**
 * Minimal record of a retired mastered habit stored outside of slots.
 * Shown in the Habit Library under the "Mastered" subheader.
 * Excluded from all active/paused/recommended logic — purely archival.
 */
export type MasteredArchiveEntry = {
  templateId: string;
  name: string;
  icon: string;
};

// ─── Assessment store ─────────────────────────────────────────────────────────

/** questionId → raw points (1–5) for a single section. */
export type SectionAnswers = Record<string, number>;

/** Internal state shape of the assessment store. */
export interface AssessmentState {
  answers: Partial<Record<string, SectionAnswers>>;
  completedAt: Partial<Record<string, number>>; // unix ms timestamp
  activeTab: string;
  /**
   * The fixed set of up to 3 habit template IDs recommended after the first
   * completed assessment. Computed once and persisted so that acting on a
   * recommendation (add / pause) never causes a replacement to appear.
   * Reset to [] by clearAll() if the user retakes the assessment from scratch.
   */
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

/** A question paired with its score — the unit used by the insights pipeline. */
export interface SortedQuestion {
  sectionId: string;
  questionId: string;
  score: 1 | 2 | 3 | 4 | 5;
}

// ─── Streak reconciler ────────────────────────────────────────────────────────

export interface ReconcileResult {
  /**
   * Final event list to assign to lastReconcileEvents.
   * Either the new events from this run, or the pruned carry-over from a clean run.
   */
  events: ReconcileEvent[];
  /** Updated freeze token balance after this reconcile pass. */
  newFreezeCount: number;
}

// ─── Habit lifecycle ──────────────────────────────────────────────────────────

export interface LogResult {
  /** True when a regular milestone freeze was earned (not the mastery reward). */
  freezeEarned: boolean;
  /** True when the habit just hit MASTERY_MILESTONE days and should receive the mastery reward. */
  mastered: boolean;
}

// ─── Component view models ────────────────────────────────────────────────────

/** A single list row in InsightsHabitPanel — either a recommended template or an active habit. */
export interface HabitPanelItem {
  key: string;
  icon: string;
  iconColor: string;
  name: string;
  chip?: { color: string; icon: string; label: string };
}

/** String alias for a question id (e.g. 'q1', 'commute_mode'). */
export type QuestionId = string;

// ─── Sync ─────────────────────────────────────────────────────────────────────

export interface SyncQueueItem {
  /** Dedup key: 'table:pk1:pk2' */
  id: string;
  table: string;
  operation: "upsert" | "delete";
  payload: Record<string, unknown>;
  /** Unix ms timestamp of when the item was enqueued. */
  enqueuedAt: number;
}

export type SyncStatus = "offline" | "syncing" | "synced";
