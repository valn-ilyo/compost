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

export interface BadgeTaglines {
  focused: string;
  split: string;
  broad: string;
  default: string;
}

export interface Badge {
  id: string;
  label: string;
  /** Inclusive lower bound of overall score (out of 100) */
  minScore: number;
  /** Inclusive upper bound */
  maxScore: number;
  /**
   * Taglines keyed by the weakest section id.
   * Values contain specific copy based on scoring distribution.
   */
  taglines: Record<string, BadgeTaglines>;
}

// ─── SDG ──────────────────────────────────────────────────────────────────────

export interface SDG {
  /** e.g. 'sdg-6' */
  id: string;
  /** e.g. 6 */
  number: number;
  name: string;
  /** One-liner shown when the chip is tapped / linked to Learn view */
  description: string;
  /** Section ids that contribute to this goal */
  sectionIds: string[];
}

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
}

export interface SelectedInsight extends QuestionInsight {
  isAffirmation: boolean;
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
  /** Links to the assessment question that triggers this recommendation, e.g. 'energy-q1' */
  id: string;
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
  /** One-time onboarding instruction calibrated to the user's score. Shown in Growth Space and Stats. */
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
}
