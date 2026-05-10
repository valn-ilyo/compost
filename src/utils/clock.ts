import { reactive } from "vue";

export const clock = reactive({
  now: (): Date => new Date(),
});
// DEV only: restore any simulated day offset (dead-code-eliminated in production).
if (import.meta.env.DEV) {
  const stored = Number(localStorage.getItem("__dev_day_offset") ?? 0);
  if (stored) {
    clock.now = () => new Date(Date.now() + stored);
  }
}

// Reassign clock.now at UTC midnight to invalidate date-dependent computed values.
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
