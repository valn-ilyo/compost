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
