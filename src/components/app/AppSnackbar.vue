<!-- Component -- global snackbar driven by useNotifier -->
<script setup lang="ts">
import { watch } from "vue";
import { useNotifier } from "@/composables/useNotifier";
const { isActive, message, color, timeout, onClosed } = useNotifier();
watch(isActive, (isNowActive) => {
  if (!isNowActive) onClosed();
});
</script>

<template>
  <VSnackbar v-model="isActive" :color="color" :timeout="timeout" multi-line>
    {{ message }}

    <template #actions>
      <VBtn
        variant="text"
        size="small"
        color="on-error"
        icon="mdi-close"
        @click="isActive = false"
      />
    </template>
  </VSnackbar>
</template>
