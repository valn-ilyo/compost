<!-- src/components/icons/IconSac.vue -->
<script setup lang="ts">
import sacSvg from '@/assets/sac.svg?raw'
import { computed } from 'vue'

const props = defineProps<{ size?: number | string }>()
const dim = computed(() => `${props.size ?? 24}px`)
</script>

<template>
  <span
    v-html="sacSvg"
    :style="{ width: dim, height: dim, display: 'inline-flex', flexShrink: 0 }"
    class="sac-icon"
  />
</template>

<style scoped>
.sac-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
