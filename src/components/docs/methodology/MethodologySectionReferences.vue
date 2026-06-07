<!-- Component -- methodology references section, numbered bibliography with hyperlinks -->
<script setup lang="ts">
import { globalRefs } from "@/data/docs/methodology-refs";
</script>

<template>
  <div class="text-overline text-medium-emphasis px-1 mb-1">References</div>

  <VCard flat rounded="xl" class="mb-8">
    <VCardText class="py-0">
      <p class="text-body-2 mb-4 text-medium-emphasis">
        All questions in the assessment are grounded in published research. The sources below are
        listed in order of first citation.
      </p>

      <div v-for="(ref, i) in globalRefs" :key="i" class="d-flex mb-3">
        <span class="text-body-2 text-medium-emphasis mr-2 flex-shrink-0">[{{ i + 1 }}]</span>
        <span class="text-body-2">
          <a
            v-if="ref.url"
            :href="ref.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary"
            >{{ ref.label }}</a
          >
          <span v-else>{{ ref.label }}</span>
        </span>
      </div>
    </VCardText>
  </VCard>
</template>
