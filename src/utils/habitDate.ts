import { clock } from "@/utils/clock";

/** Current date as a UTC ISO string (YYYY-MM-DD). */
export function todayISO(): string {
  return clock.now().toISOString().slice(0, 10);
}

/** Yesterday's date as a UTC ISO string (YYYY-MM-DD). */
export function yesterdayISO(): string {
  const d = clock.now();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
