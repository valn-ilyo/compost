// TypeScript row shapes for Supabase tables shared across stores

// Stores use Supabase's inferred generics for INSERT types -- only cross-store row shapes live here.

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

export interface AssessmentAnswerRow {
  user_id:      string;                    // uuid, FK → auth.users
  section_id:   string;                    // 'transport' | 'food' | ...
  answers:      Record<string, number>;    // { q1: 3, q2: 5, ... }
  score:        number;                    // precomputed scaled score
  completed_at: string;                    // timestamptz
}
