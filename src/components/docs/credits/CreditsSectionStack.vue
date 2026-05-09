<template>
  <v-row justify="start" density="compact">
    <v-col>
      <div class="text-overline text-medium-emphasis px-1 mb-2">Stack</div>
      <v-row density="compact">
        <v-col cols="12" sm="6">
          <v-card flat rounded="xl">
            <v-list-item
              title="Material Design Icons"
              subtitle="Open-source icon set by Pictogrammers"
              lines="two"
            >
              <template #prepend><v-icon>mdi-vector-square</v-icon></template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card flat rounded="xl">
            <v-list-item
              title="Pinia"
              subtitle="Store management with persistence across sessions"
              lines="two"
            >
              <template #prepend><v-icon>mdi-fruit-pineapple</v-icon></template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card flat rounded="xl">
            <v-list-item
              title="Supabase"
              subtitle="Authentication, PostgreSQL database, and cross-device sync"
              lines="two"
            >
              <template #prepend><v-icon>mdi-lightning-bolt</v-icon></template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card flat rounded="xl">
            <v-list-item
              title="TypeScript"
              subtitle="Type-safe data models, stores, and composables"
              lines="two"
            >
              <template #prepend><v-icon>mdi-language-typescript</v-icon></template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card flat rounded="xl">
            <v-list-item
              title="Vite + vite-plugin-pwa"
              subtitle="Build tooling and offline-capable Progressive Web App support"
              lines="two"
            >
              <template #prepend><v-icon>mdi-flash</v-icon></template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card flat rounded="xl">
            <v-list-item
              title="Vue"
              subtitle="Composition API, reactive state, and component model"
              lines="two"
            >
              <template #prepend><v-icon>mdi-vuejs</v-icon></template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card flat rounded="xl">
            <v-list-item
              title="Vuetify"
              subtitle="Material Design component library for Vue"
              lines="two"
            >
              <template #prepend><v-icon>mdi-vuetify</v-icon></template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card flat rounded="xl">
            <v-list-item
              title="VueUse"
              subtitle="Composable utilities and animations for the Composition API"
              lines="two"
            >
              <template #prepend><v-icon>mdi-alpha-u</v-icon></template>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
