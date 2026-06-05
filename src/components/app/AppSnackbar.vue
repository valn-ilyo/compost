<!-- Component -- global snackbar driven by useNotifier -->
<script setup lang="ts">
import { watch } from 'vue'
import { useNotifier } from '@/composables/useNotifier'
const { isActive, message, color, timeout, onClosed } = useNotifier()
watch(isActive, (val) => {
  if (!val) onClosed()
})
</script>

<template>
  <v-snackbar v-model="isActive" :color="color" :timeout="timeout" multi-line>
    {{ message }}

    <template #actions>
      <v-btn
        variant="text"
        size="small"
        color="on-error"
        @click="isActive = false"
        icon="mdi-close"
      />
    </template>
  </v-snackbar>
</template>
