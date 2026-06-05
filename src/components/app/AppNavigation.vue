<!-- Component -- responsive navigation, rail drawer on md+ and bottom nav on mobile -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const items = ref([
  {
    title: 'Home',
    iconOutline: 'mdi-home-outline',
    iconFilled: 'mdi-home',
    to: '/',
    exact: true,
  },
  {
    title: 'Assessment',
    iconOutline: 'mdi-receipt-text-edit-outline',
    iconFilled: 'mdi-receipt-text-edit',
    to: '/assessment',
  },
  {
    title: 'Mastery',
    iconOutline: 'mdi-chart-timeline-variant',
    iconFilled: 'mdi-chart-timeline-variant-shimmer',
    to: '/mastery',
  },
  {
    title: 'Profile',
    iconOutline: 'mdi-account-outline',
    iconFilled: 'mdi-account',
    to: '/profile',
    exact: true,
  },
])

const selected = ref<string>()

watch(
  () => route.path,
  (newPath) => {
    selected.value = newPath
  },
  { immediate: true },
)
</script>

<template>
  <VNavigationDrawer
    v-if="$vuetify.display.mdAndUp"
    rail
    permanent
    expand-on-hover
    color="surface-light"
    :open-delay="150"
  >
    <VList nav>
      <VListItem
        v-for="(item, i) in items"
        :key="i"
        :exact="item.exact || false"
        :value="item"
        :to="item.to"
        :title="item.title"
        rounded="xl"
        color="secondary"
      >
        <template #prepend="{ isActive }">
          <VIcon>
            {{ isActive ? item.iconFilled : item.iconOutline }}
          </VIcon>
        </template>
      </VListItem>
    </VList>
  </VNavigationDrawer>
  <VBottomNavigation
    v-if="!$vuetify.display.mdAndUp"
    v-model="selected"
    color="secondary"
    bg-color="surface-light"
    :elevation="0"
    grow
    class="border-t"
  >
    <VBtn
      v-for="item in items"
      :key="item.title"
      :value="item.to"
      :to="item.to"
      :exact="item.exact || false"
      min-width="0"
      color="secondary"
    >
      <VIcon>{{ selected === item.to ? item.iconFilled : item.iconOutline }}</VIcon>
      <span>{{ item.title }}</span>
    </VBtn>
  </VBottomNavigation>
</template>
