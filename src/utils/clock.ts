import { reactive } from "vue";

export const clock = reactive({
  now: (): Date => new Date(),
});

// ─── Midnight callbacks ───────────────────────────────────────────────────────
//
// OLD: scheduleMidnightRefresh() only reassigned clock.now — nothing else ran
// at midnight. Any caller that needed to act at midnight (e.g. reconcileStreaks)
// had no hook to register against, so it simply never ran for open sessions.
//
// NEW: expose onMidnight() so callers register their own callbacks here.
// clock.ts stays store-free — no imports from @/stores/*.
// The registration site is App.vue onMounted — see the onMidnight() call there.

const midnightCallbacks: Array<() => void> = [];

/**
 * Register a callback to run once each time the UTC day rolls over.
 * Call this from App.vue onMounted — not from store setup — so the
 * dependency direction stays: stores ← App ← clock (never clock → stores).\
 *
 * See: App.vue — onMidnight(() => { if (syncStore.isHydrated) masteryStore.reconcileStreaks(); })
 */
export function onMidnight(cb: () => void): void {
  midnightCallbacks.push(cb);
}

// Reassign clock.now at UTC midnight to invalidate date-dependent computed
// values, then fire every registered midnight callback.
function scheduleMidnightRefresh() {
  const msUntilMidnight = 86_400_000 - (Date.now() % 86_400_000);
  setTimeout(() => {
    clock.now = () => new Date();
    scheduleMidnightRefresh();

    // Fire all registered midnight callbacks after the clock is updated.
    // Callbacks are registered via onMidnight() — see App.vue onMounted.
    for (const cb of midnightCallbacks) cb();
  }, msUntilMidnight);
}

scheduleMidnightRefresh();
