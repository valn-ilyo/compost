<!-- Component -- credits tab, renders the active credits section by id -->
<script setup lang="ts">
import CreditsSectionTeam from './credits/CreditsSectionTeam.vue'
import CreditsSectionStack from './credits/CreditsSectionStack.vue'
import CreditsSectionLicense from './credits/CreditsSectionLicense.vue'

defineProps<{
  activeSection: string
}>()
</script>

<template>
  <CreditsSectionTeam v-if="activeSection === 'team'" />
  <CreditsSectionStack v-if="activeSection === 'stack'" />
  <CreditsSectionLicense v-if="activeSection === 'license'" />
</template>
