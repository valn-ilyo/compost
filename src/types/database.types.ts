// src/types/database.types.ts
//
// Mirrors the Supabase schema exactly.
// One interface per table, each with Row / Insert / Update variants.
//   Row    — what you get back from a SELECT
//   Insert — what you send for an INSERT (generated columns omitted)
//   Update — partial Insert for PATCH/upsert

// ─── profiles ─────────────────────────────────────────────────────────────────

export interface ProfileRow {
  user_id: string; // uuid, PK, FK → auth.users
  name: string | null;
  roll_no: string | null;
  gender: string | null;
  dob: string | null; // ISO date YYYY-MM-DD
  theme: string | null; // e.g. 'light', 'dark-high-contrast'
  is_admin: boolean;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export type ProfileInsert = Omit<ProfileRow, "created_at" | "updated_at">;

export type ProfileUpdate = Partial<Omit<ProfileRow, "user_id" | "created_at" | "updated_at">>;

// ─── assessment_answers ───────────────────────────────────────────────────────

export interface AssessmentAnswerRow {
  user_id: string; // uuid, FK → auth.users
  section_id: string; // 'transport' | 'food' | 'energy' | 'consumption' | 'waste' | 'water' | 'digital'
  answers: Record<string, number>; // { q1: 3, q2: 5, ... } raw points per question
  score: number; // precomputed scaled score for this section
  completed_at: string; // timestamptz
}

export type AssessmentAnswerInsert = AssessmentAnswerRow; // all fields required on insert

export type AssessmentAnswerUpdate = Pick<
  AssessmentAnswerRow,
  "answers" | "score" | "completed_at"
>;

// ─── habit_slots ──────────────────────────────────────────────────────────────

export interface HabitSlotRow {
  user_id: string; // uuid, FK → auth.users
  template_id: string; // FK into the static habit library in code
  streak: number;
  last_logged_date: string | null; // ISO date YYYY-MM-DD
  is_paused: boolean;
  is_mastered: boolean;
  freeze_used: boolean;
  created_at: string; // timestamptz — used to derive slot order
  updated_at: string; // timestamptz
}

export type HabitSlotInsert = Omit<HabitSlotRow, "created_at" | "updated_at">;

export type HabitSlotUpdate = Partial<
  Omit<HabitSlotRow, "user_id" | "template_id" | "created_at" | "updated_at">
>;

// ─── mastery_state ────────────────────────────────────────────────────────────

export interface MasteryStateRow {
  user_id: string; // uuid, PK, FK → auth.users
  freeze_count: number;
  updated_at: string; // timestamptz
}

export type MasteryStateInsert = Omit<MasteryStateRow, "updated_at">;

export type MasteryStateUpdate = Pick<MasteryStateRow, "freeze_count">;

// ─── mastered_archive ─────────────────────────────────────────────────────────

export interface MasteredArchiveRow {
  user_id: string; // uuid, FK → auth.users
  template_id: string;
  retired_at: string; // timestamptz
}

export type MasteredArchiveInsert = MasteredArchiveRow; // all fields required on insert
