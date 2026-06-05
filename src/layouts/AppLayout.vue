<!-- Component -- root layout with nav bar, conditional climate clock system bar, and router outlet -->
<script setup lang="ts">
import AppNavigation from '@/components/app/AppNavigation.vue'
import ClimateClock from '@/components/climate/ClimateClock.vue'
import { useClockVisibleStore } from '@/stores/clock-visible.store'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const { clockVisible } = storeToRefs(useClockVisibleStore())
const route = useRoute()
const showClock = computed(() => clockVisible.value && route.name === 'home')
</script>

<template>
  <AppNavigation />
  <Transition name="clock-bar">
    <v-system-bar
      v-if="showClock"
      :height="$vuetify.display.mdAndUp ? 72 : 128"
      class="pa-0 text-start"
      style="align-items: stretch"
    >
      <ClimateClock />
    </v-system-bar>
  </Transition>
  <v-main>
    <RouterView />
  </v-main>
</template>

<style>
.clock-bar-enter-active {
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.35s ease;
}
.clock-bar-leave-active {
  transition:
    transform 0.35s cubic-bezier(0.55, 0, 1, 0.45),
    opacity 0.3s ease;
}
.clock-bar-enter-from,
.clock-bar-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
