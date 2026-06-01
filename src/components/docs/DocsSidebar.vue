<!-- Component -- docs sidebar nav, switches items based on the active route tab -->
<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { guideNav, methodologyNav, creditsNav, type NavItem } from "@/data/docs-nav";

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const route = useRoute();

const navItems = computed<NavItem[]>(() => {
  switch (route.params.tab) {
    case "methodology":
      return methodologyNav;
    case "credits":
      return creditsNav;
    default:
      return guideNav;
  }
});

function onItemClick(item: NavItem) {
  emit("update:modelValue", item.id);
}
</script>

<template>
  <v-list nav density="compact" class="py-2 px-2">
    <v-list-item
      v-for="item in navItems"
      :key="item.id"
      :prepend-icon="item.icon"
      :title="item.label"
      :active="modelValue === item.id"
      color="on-secondary"
      rounded="lg"
      @click="onItemClick(item)"
    />
  </v-list>
</template>
