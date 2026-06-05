// Reactive clock singleton with midnight callback registration

import { reactive } from 'vue'

export const clock = reactive({
  now: (): Date => new Date(),
})

const midnightCallbacks: Array<() => void> = []

/**
 * Register a callback to run once each time the UTC day rolls over.
 * Call this from App.vue onMounted -- not from store setup -- so the
 * dependency direction stays: stores ← App ← clock (never clock → stores).
 *
 * See: App.vue -- onMidnight(() => { if (syncStore.isHydrated) masteryStore.reconcileStreaks(); })
 */
export function onMidnight(cb: () => void): void {
  midnightCallbacks.push(cb)
}

function scheduleMidnightRefresh() {
  const msUntilMidnight = 86_400_000 - (Date.now() % 86_400_000)
  setTimeout(() => {
    clock.now = () => new Date()
    scheduleMidnightRefresh()

    for (const cb of midnightCallbacks) cb()
  }, msUntilMidnight)
}

scheduleMidnightRefresh()
