// ─── database.ts ─────────────────────────────────────────────────────────────
// TypeScript row shapes for the Supabase tables that need named types outside
// of their owning store. Insert aliases and Row types used only internally by
// their own store have been removed — the stores rely on Supabase's inferred
// generics or inline object literals for those writes.
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

export type ProfileUpdate = Partial<Omit<ProfileRow, 'user_id' | 'created_at' | 'updated_at'>>;

// ─── assessment_answers ───────────────────────────────────────────────────────

export interface AssessmentAnswerRow {
  user_id:      string;                    // uuid, FK → auth.users
  section_id:   string;                    // 'transport' | 'food' | ...
  answers:      Record<string, number>;    // { q1: 3, q2: 5, ... }
  score:        number;                    // precomputed scaled score
  completed_at: string;                    // timestamptz
}
