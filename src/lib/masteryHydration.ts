import type { Ref } from "vue";
import type { MasteredArchiveEntry, UserHabit } from "@/types/app.types";
import { supabase } from "@/lib/supabaseClient";
import { HABIT_TEMPLATES } from "@/data/habits";

/**
 * Pull habit slots, mastery state, and mastered archive from Supabase and
 * merge them into the store refs passed in.
 *
 * Merge rules:
 *   - Local wins: remote slots are skipped if a local slot with the same
 *     templateId already exists (the queue may have newer in-flight writes).
 *   - freezeCount is only taken from remote if local slots are all empty
 *     (i.e. fresh device with no local data yet).
 *   - Archive deduplication: remote archive rows already present locally are
 *     skipped by templateId.
 *   - DB inconsistency guard: if a slot row has is_mastered=true AND an
 *     archive row exists for the same template, the slot is skipped — the
 *     archive is the canonical representation.
 *
 * Throws on network or Supabase errors so the hydration caller can surface
 * the error state.
 */
export async function hydrateFromSupabase(
  userId: string,
  slots: Ref<UserHabit[]>,
  freezeCount: Ref<number>,
  masteredArchive: Ref<MasteredArchiveEntry[]>,
): Promise<void> {
  const [slotsRes, stateRes, archiveRes] = await Promise.all([
    supabase.from("habit_slots").select("*").eq("user_id", userId),
    supabase.from("mastery_state").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("mastered_archive").select("*").eq("user_id", userId),
  ]);

  if (slotsRes.error) throw slotsRes.error;
  if (stateRes.error) throw stateRes.error;
  if (archiveRes.error) throw archiveRes.error;

  // ── Habit slots ──────────────────────────────────────────────────────────

  // Capture before the loop — the loop pushes remote rows into slots, so
  // checking slots.value.length === 0 *after* would always be false when
  // the user has remote data. We need the pre-hydration count to detect a
  // "fresh device with no local data" scenario for freeze count below.
  const localSlotCount = slots.value.length;

  const localTemplateIds = new Set(slots.value.map((h) => h.templateId));

  // Pre-compute the full set of archived template IDs (local already in
  // masteredArchive + any remote rows we're about to add) so the slots loop
  // can skip is_mastered rows that are already represented in the archive.
  // Without this, a DB inconsistency (slot row with is_mastered=true AND an
  // archive row for the same template) causes the habit to appear in both
  // the active slot list and the mastered archive simultaneously.
  const allArchivedTemplateIds = new Set([
    ...masteredArchive.value.map((e) => e.templateId),
    ...(archiveRes.data ?? []).map((r) => r.template_id),
  ]);

  for (const row of slotsRes.data ?? []) {
    if (localTemplateIds.has(row.template_id)) continue;
    // If this slot is mastered and the archive already has (or will have)
    // an entry for it, skip — the archive is the canonical representation.
    if (row.is_mastered && allArchivedTemplateIds.has(row.template_id)) continue;

    const template = HABIT_TEMPLATES.find((t) => t.id === row.template_id);
    if (!template) continue; // template was removed from code — skip

    slots.value.push({
      id: String(Date.now() + Math.random()), // stable only for this session
      templateId: row.template_id,
      name: template.name,
      icon: template.icon,
      iconOutline: template.iconOutline,
      sectionId: template.sectionId,
      prompt: template.prompt,
      when: template.when,
      instruction: template.instruction,
      streak: row.streak,
      lastLoggedDate: row.last_logged_date,
      isPaused: row.is_paused,
      isMastered: row.is_mastered,
      freezeUsed: row.freeze_used,
    });
  }

  // ── Mastery state (freeze count) ─────────────────────────────────────────
  // Only take from remote if local is a clean slate — no slots at all before
  // this hydration run. If the user had local data, local wins.

  if (stateRes.data && localSlotCount === 0) {
    freezeCount.value = stateRes.data.freeze_count;
  }

  // ── Mastered archive ─────────────────────────────────────────────────────

  const localArchivedIds = new Set(masteredArchive.value.map((e) => e.templateId));

  for (const row of archiveRes.data ?? []) {
    if (localArchivedIds.has(row.template_id)) continue;

    const template = HABIT_TEMPLATES.find((t) => t.id === row.template_id);
    if (!template) continue;

    masteredArchive.value.push({
      templateId: row.template_id,
      name: template.name,
      icon: template.icon,
    });
  }
}
