// ─── database.ts ─────────────────────────────────────────────────────────────
// TypeScript row shapes for every Supabase table.
//
// Phase 6 changes:
//   - HabitSlotRow: added `status: 'active' | 'paused'`. The row is now mutable
//     server-authoritative state. All writes go through SECURITY DEFINER RPCs.
//     Client RLS is SELECT-only.
//   - HabitPauseEventRow: NEW. One row per pause window per habit. Written by
//     slot_pause (open) and slot_resume / slot_remove / slot_retire (close).
//   - SlotEventRow: REMOVED. The slot_events table no longer exists.
// ─────────────────────────────────────────────────────────────────────────────

// ─── profiles ─────────────────────────────────────────────────────────────────

export interface ProfileRow {
  user_id:    string;       // uuid, PK, FK → auth.users
  name:       string | null;
  roll_no:    string | null;
  gender:     string | null;
  dob:        string | null; // ISO date YYYY-MM-DD
  theme:      string | null; // e.g. 'light', 'dark-high-contrast'
  is_admin:   boolean;
  created_at: string;        // timestamptz
  updated_at: string;        // timestamptz
}

export type ProfileInsert = Omit<ProfileRow, 'created_at' | 'updated_at'>;
export type ProfileUpdate  = Partial<Omit<ProfileRow, 'user_id' | 'created_at' | 'updated_at'>>;

// ─── assessment_answers ───────────────────────────────────────────────────────

export interface AssessmentAnswerRow {
  user_id:      string;                    // uuid, FK → auth.users
  section_id:   string;                    // 'transport' | 'food' | ...
  answers:      Record<string, number>;    // { q1: 3, q2: 5, ... }
  score:        number;                    // precomputed scaled score
  completed_at: string;                    // timestamptz
}

export type AssessmentAnswerInsert = AssessmentAnswerRow;

// ─── habit_slots ──────────────────────────────────────────────────────────────
//
// Mutable server-authoritative state. One row per habit the user holds in any
// non-library state (active or paused).
//
// status:
//   'active' — occupies one of three active slots; counts toward the cap.
//   'paused' — slot held, streak preserved; does NOT count toward the cap.
//
// created_at — set once by DEFAULT now() at INSERT, never modified.
//              Streak boundary: the walker ignores logs before this date.
//
// All writes go through SECURITY DEFINER RPCs. Client RLS is SELECT-only.

export interface HabitSlotRow {
  user_id:     string;                    // uuid, FK → auth.users
  template_id: string;                    // FK into static habit library
  status:      'active' | 'paused';
  created_at:  string;                    // timestamptz — set once, never updated
}

export type HabitSlotInsert = Omit<HabitSlotRow, 'created_at'>;

// ─── habit_pause_events ───────────────────────────────────────────────────────
//
// One row per pause window per habit. Used by the streak walker to skip gaps.
//
// paused_at  — when slot_pause ran (window opens).
// resumed_at — when slot_resume / slot_remove / slot_retire ran (null = still open).
//
// PK: (user_id, template_id, paused_at). At most one open window per
// (user_id, template_id) at any time.
//
// All writes go through SECURITY DEFINER RPCs. Client RLS is SELECT-only.

export interface HabitPauseEventRow {
  user_id:     string;        // uuid, FK → auth.users
  template_id: string;
  paused_at:   string;        // timestamptz
  resumed_at:  string | null; // timestamptz, null = window still open
}

export type HabitPauseEventInsert = HabitPauseEventRow;

// ─── habit_logs ───────────────────────────────────────────────────────────────
//
// One row per logged day per habit. CLIENT ONLY — the cron never writes here.
// Unique on (user_id, template_id, date).

export interface HabitLogRow {
  user_id:     string;
  template_id: string;
  date:        string;         // YYYY-MM-DD (IST)
  value:       'yes' | 'no';
  created_at:  string;         // timestamptz
}

export type HabitLogInsert = HabitLogRow;

// ─── freeze_ledger ────────────────────────────────────────────────────────────
//
// One row per freeze token event. Append-only.
// reason='spent' is CRON ONLY — the client writes 'milestone' and 'mastery' only.
// Unique on (user_id, template_id, date, reason).

export interface FreezeLedgerDbRow {
  user_id:     string;
  template_id: string;
  delta:       number;          // +1 earned, -1 spent
  reason:      'milestone' | 'mastery' | 'spent';
  date:        string;          // YYYY-MM-DD (IST)
  created_at:  string;          // timestamptz
}

export type FreezeLedgerInsert = FreezeLedgerDbRow;

// ─── mastered_archive ─────────────────────────────────────────────────────────
//
// One row per retired mastered habit. Written once via slot_retire RPC.
// Unique on (user_id, template_id).

export interface MasteredArchiveRow {
  user_id:     string;
  template_id: string;
  created_at:  string;          // timestamptz
}

export type MasteredArchiveInsert = MasteredArchiveRow;

// ─── push_subscriptions ───────────────────────────────────────────────────────

export interface PushSubscriptionRow {
  id:          string;  // uuid, PK
  user_id:     string;  // uuid, FK → auth.users
  endpoint:    string;
  p256dh:      string;
  auth:        string;
  created_at:  string;  // timestamptz
}

export type PushSubscriptionInsert = Omit<PushSubscriptionRow, 'id' | 'created_at'>;
