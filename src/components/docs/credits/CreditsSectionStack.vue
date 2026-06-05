<!-- Component -- credits stack section, open source dependencies -->
<template>
  <VRow justify="start" density="compact">
    <VCol>
      <div class="text-overline text-medium-emphasis px-1 mb-2">Stack</div>
      <VRow density="compact">
        <VCol cols="12" sm="6">
          <VCard flat rounded="xl">
            <VListItem
              title="Material Design Icons"
              subtitle="Open-source icon set by Pictogrammers"
              lines="two"
            >
              <template #prepend><VIcon>mdi-vector-square</VIcon></template>
            </VListItem>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6">
          <VCard flat rounded="xl">
            <VListItem
              title="Pinia"
              subtitle="Store management with persistence across sessions"
              lines="two"
            >
              <template #prepend><VIcon>mdi-fruit-pineapple</VIcon></template>
            </VListItem>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6">
          <VCard flat rounded="xl">
            <VListItem
              title="Supabase"
              subtitle="Authentication, PostgreSQL database, and cross-device sync"
              lines="two"
            >
              <template #prepend><VIcon>mdi-lightning-bolt</VIcon></template>
            </VListItem>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6">
          <VCard flat rounded="xl">
            <VListItem
              title="TypeScript"
              subtitle="Type-safe data models, stores, and composables"
              lines="two"
            >
              <template #prepend><VIcon>mdi-language-typescript</VIcon></template>
            </VListItem>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6">
          <VCard flat rounded="xl">
            <VListItem
              title="Vite + vite-plugin-pwa"
              subtitle="Build tooling and offline-capable Progressive Web App support"
              lines="two"
            >
              <template #prepend><VIcon>mdi-flash</VIcon></template>
            </VListItem>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6">
          <VCard flat rounded="xl">
            <VListItem
              title="Vue"
              subtitle="Composition API, reactive state, and component model"
              lines="two"
            >
              <template #prepend><VIcon>mdi-vuejs</VIcon></template>
            </VListItem>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6">
          <VCard flat rounded="xl">
            <VListItem
              title="Vuetify"
              subtitle="Material Design component library for Vue"
              lines="two"
            >
              <template #prepend><VIcon>mdi-vuetify</VIcon></template>
            </VListItem>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6">
          <VCard flat rounded="xl">
            <VListItem
              title="VueUse"
              subtitle="Composable utilities and animations for the Composition API"
              lines="two"
            >
              <template #prepend><VIcon>mdi-alpha-u</VIcon></template>
            </VListItem>
          </VCard>
        </VCol>
      </VRow>
    </VCol>
  </VRow>
</template>
