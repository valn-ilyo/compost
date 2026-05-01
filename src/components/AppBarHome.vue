<script setup lang="ts">
import { useClockVisibleStore } from '@/stores/climateClock'

const clockVisibleStore = useClockVisibleStore()
</script>

<template>
  <v-app-bar color="surface" flat>
    <template #prepend>
       <v-app-bar-nav-icon :ripple="false" style="cursor: default; pointer-events: none">
        <v-icon icon="custom:sac" size="48" />
      </v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>Compost</v-app-bar-title>

    <template #append>
      <v-btn
        :icon="clockVisibleStore.clockVisible ? 'mdi-clock-minus-outline' : 'mdi-clock-plus-outline'"
        @click="clockVisibleStore.toggleClock()"
      />
    </template>
  </v-app-bar>
</template>
