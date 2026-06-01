import { clock } from '@/utils/clock'

// ─── Timezone note ────────────────────────────────────────────────────────────
// All date strings stored in the ledger tables are IST dates (UTC+5:30).
// Using raw UTC dates would cause Indian users logging between midnight IST and
// 05:30 IST to write rows on the wrong calendar day, because the UTC date has
// not yet rolled over. The Supabase cron job uses the same IST offset for all
// date arithmetic, so client and server always agree on what "today" means.
//
// If the app expands to other timezones, this offset becomes per-user and must
// be stored in the profile table. For now India-only is the stated scope.
// ─────────────────────────────────────────────────────────────────────────────

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000 // UTC+05:30

/** Returns the current time shifted to IST. */
function nowIST(): Date {
  return new Date(clock.now().getTime() + IST_OFFSET_MS)
}

/** Today's date in IST as a YYYY-MM-DD string. */
export function todayISO(): string {
  return nowIST().toISOString().slice(0, 10)
}

/** Yesterday's date in IST as a YYYY-MM-DD string. */
export function yesterdayISO(): string {
  const d = nowIST()
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}
