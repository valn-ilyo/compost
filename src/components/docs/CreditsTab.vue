<script setup lang="ts">
import CreditsSectionTeam     from "./credits/CreditsSectionTeam.vue";
import CreditsSectionSoftware from "./credits/CreditsSectionSoftware.vue";
import CreditsSectionLicense  from "./credits/CreditsSectionLicense.vue";

defineProps<{
  activeSection: string;
}>();
</script>

<template>
  <CreditsSectionTeam     v-if="activeSection === 'team'" />
  <CreditsSectionSoftware v-if="activeSection === 'software'" />
  <CreditsSectionLicense  v-if="activeSection === 'license'" />
</template>
