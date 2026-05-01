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
    title: 'Learn',
    iconOutline: 'mdi-school-outline',
    iconFilled: 'mdi-school',
    to: '/Learn',
  },
  {
    title: 'Profile',
    iconOutline: 'mdi-account-outline',
    iconFilled: 'mdi-account',
    to: '/profile',
    exact: true,
  },
])

const selected = ref<string>() // will hold the active route path

// Sync selected with current route on mount and route changes
watch(
  () => route.path,
  (newPath) => {
    selected.value = newPath
  },
  { immediate: true },
)
</script>

<template>
  <v-navigation-drawer
    v-if="$vuetify.display.mdAndUp"
    rail
    permanent
    expand-on-hover
    color="surface-light"
    :open-delay="150"
  >
    <v-list nav>

      <v-list-item
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
          <v-icon>
            {{ isActive ? item.iconFilled : item.iconOutline }}
          </v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
  <v-bottom-navigation
    v-model="selected"
    v-if="!$vuetify.display.mdAndUp"
    color="secondary"
    bg-color="surface-light"
    :elevation="0"
    grow
    class="border-t"
  >
    <v-btn
      v-for="item in items"
      :key="item.title"
      :value="item.to"
      :to="item.to"
      :exact="item.exact || false"
      min-width="0"
      color="secondary"
    >
      <v-icon>{{ selected === item.to ? item.iconFilled : item.iconOutline }}</v-icon>
      <span>{{ item.title }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>
