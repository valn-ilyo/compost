import { clock } from "@/stores/clock";

/**
 * Current date as a UTC ISO string (YYYY-MM-DD).
 * Always use toISOString() — never local-time getDate(), which shifts in
 * non-UTC zones (e.g. IST = UTC+5:30).
 */
export function todayISO(): string {
  return clock.now().toISOString().slice(0, 10);
}

/**
 * Yesterday's date as a UTC ISO string (YYYY-MM-DD).
 * Arithmetic stays in UTC via setUTCDate / getUTCDate.
 */
export function yesterdayISO(): string {
  const d = clock.now();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
