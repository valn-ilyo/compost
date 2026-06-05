// Score color utility -- maps a 0-1 performance ratio to a Vuetify color token

/**
 * Returns a Vuetify color token based on a 0–1 performance percentage.
 * Used consistently across: hero ring, section breakdown dots/bars, SDG chips.
 */
export function scoreColor(pct: number): string {
  if (pct < 0.5) return 'error'
  if (pct < 0.65) return 'warning'
  if (pct < 0.85) return 'info'
  return 'success'
}
