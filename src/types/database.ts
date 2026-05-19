// ─── database.ts ─────────────────────────────────────────────────────────────
// TypeScript row shapes for every Supabase table.
//
// Phase 4 schema changes vs previous:
//   - HabitSlotRow: stripped of all mutable columns. Only carries identity +
//     timestamp. All derived habit state lives in the four ledger tables.
//   - MasteryStateRow: REMOVED. The mastery_state table is dropped.
//   - HabitLogRow, FreezeLedgerDbRow, SlotEventRow: NEW. The three new ledger tables.
//   - MasteredArchiveRow: updated to use created_at (was retired_at).
//
// NOTE: These types mirror the Supabase schema. Run the Phase 4 SQL migration
// before deploying the Phase 4 client build — the client will write to the new
// table shapes immediately on first hydration.
// ─────────────────────────────────────────────────────────────────────────────

// ─── profiles ─────────────────────────────────────────────────────────────────

export interface ProfileRow {
  user_id: string;        // uuid, PK, FK → auth.users
  name: string | null;
  roll_no: string | null;
  gender: string | null;
  dob: string | null;     // ISO date YYYY-MM-DD
  theme: string | null;   // e.g. 'light', 'dark-high-contrast'
  is_admin: boolean;
  created_at: string;     // timestamptz
  updated_at: string;     // timestamptz
}

export type ProfileInsert = Omit<ProfileRow, "created_at" | "updated_at">;

export type ProfileUpdate = Partial<Omit<ProfileRow, "user_id" | "created_at" | "updated_at">>;

// ─── assessment_answers ───────────────────────────────────────────────────────

export interface AssessmentAnswerRow {
  user_id: string;    // uuid, FK → auth.users
  section_id: string; // 'transport' | 'food' | 'energy' | 'consumption' | 'waste' | 'water' | 'digital'
  answers: Record<string, number>; // { q1: 3, q2: 5, ... } raw points per question
  score: number;      // precomputed scaled score for this section
  completed_at: string; // timestamptz
}

export type AssessmentAnswerInsert = AssessmentAnswerRow;

// ─── habit_slots ──────────────────────────────────────────────────────────────
//
// Phase 4: all mutable columns removed. habit_slots is now a lightweight index
// of which templates a user has ever placed in a slot. All derived state
// (streak, is_paused, is_mastered, freeze_used) lives in the four ledger tables.
//
// Columns dropped: streak, last_logged_date, is_paused, is_mastered, freeze_used, updated_at.

export interface HabitSlotRow {
  user_id: string;     // uuid, FK → auth.users
  template_id: string; // FK into static habit library
  created_at: string;  // timestamptz — first time this habit was ever added
}

export type HabitSlotInsert = HabitSlotRow;

// ─── habit_logs ───────────────────────────────────────────────────────────────
//
// One row per logged day per habit. CLIENT ONLY — the cron never writes here.
// Unique on (user_id, template_id, date).

export interface HabitLogRow {
  user_id: string;
  template_id: string;
  date: string;               // YYYY-MM-DD (IST)
  value: 'yes' | 'no';
  created_at: string;         // timestamptz
}

export type HabitLogInsert = HabitLogRow;

// ─── freeze_ledger ────────────────────────────────────────────────────────────
//
// One row per freeze token event. Append-only.
// reason='spent' is CRON ONLY — the client writes 'milestone' and 'mastery' only.
// Unique on (user_id, template_id, date, reason).

export interface FreezeLedgerDbRow {
  user_id: string;
  template_id: string;
  delta: number;              // +1 earned, -1 spent
  reason: 'milestone' | 'mastery' | 'spent';
  date: string;               // YYYY-MM-DD (IST)
  created_at: string;         // timestamptz
}

export type FreezeLedgerInsert = FreezeLedgerDbRow;

// ─── slot_events ──────────────────────────────────────────────────────────────
//
// One row per lifecycle event per habit. Append-only.
// Unique on (user_id, template_id, created_at).

export interface SlotEventRow {
  user_id: string;
  template_id: string;
  event: 'added' | 'paused' | 'resumed' | 'removed' | 'retired';
  created_at: string;         // timestamptz
}

export type SlotEventInsert = SlotEventRow;

// ─── mastered_archive ─────────────────────────────────────────────────────────
//
// One row per retired mastered habit. Written once, never updated.
// Unique on (user_id, template_id).

export interface MasteredArchiveRow {
  user_id: string;
  template_id: string;
  created_at: string;         // timestamptz (was retired_at in pre-Phase-4 schema)
}

export type MasteredArchiveInsert = MasteredArchiveRow;

// ─── push_subscriptions ───────────────────────────────────────────────────────

export interface PushSubscriptionRow {
  id: string;         // uuid, PK
  user_id: string;    // uuid, FK → auth.users
  endpoint: string;   // unique per device
  p256dh: string;     // public key for payload encryption
  auth: string;       // auth secret for payload encryption
  created_at: string; // timestamptz
}

export type PushSubscriptionInsert = Omit<PushSubscriptionRow, "id" | "created_at">;
