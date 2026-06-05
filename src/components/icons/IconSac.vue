<!-- Component -- SAC logo icon, renders the raw SVG asset at a configurable size -->
<script setup lang="ts">
import sacSvg from '@/assets/sac.svg?raw'
import { computed } from 'vue'

const props = defineProps<{ size?: number | string }>()
const dim = computed(() => `${props.size ?? 24}px`)
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <span :style="{ width: dim, height: dim, display: 'inline-flex', flexShrink: 0 }" class="sac-icon" v-html="sacSvg" />
</template>

<style scoped>
.sac-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
