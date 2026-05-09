import { reactive } from "vue"; // add this

export const clock = reactive({
  // was: export const clock = {
  now: (): Date => new Date(),
});
// Restore any simulated day offset so refreshing the app mid-simulation
// keeps the clock where DevView left it. Vite replaces import.meta.env.DEV
// with false at build time so this entire block is dead-code-eliminated
// in production — clock.now stays as () => new Date() and nothing ships.
if (import.meta.env.DEV) {
  const stored = Number(localStorage.getItem("__dev_day_offset") ?? 0);
  if (stored) {
    clock.now = () => new Date(Date.now() + stored);
  }
}

// Schedule a reactive clock.now reassignment at each UTC midnight.
// Because clock is a reactive object, reassigning the property invalidates
// every Vue computed that reads clock.now — allLoggedToday, unloggedToday,
// isLoggedToday — so habits logged at 11:58 PM don't stay "logged today"
// at 12:01 AM without a user interaction to trigger a recompute.
// Skipped in DEV when a day-simulation offset is active so DevView stays consistent.
function scheduleMidnightRefresh() {
  const msUntilMidnight = 86_400_000 - (Date.now() % 86_400_000);
  setTimeout(() => {
    if (!import.meta.env.DEV || !localStorage.getItem("__dev_day_offset")) {
      clock.now = () => new Date();
    }
    scheduleMidnightRefresh();
  }, msUntilMidnight);
}
scheduleMidnightRefresh();
