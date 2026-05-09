<template>
  <v-row justify="start" density="compact">
    <v-col>
      <div class="text-overline text-medium-emphasis px-1 mb-2">Supervisors</div>
      <v-row class="mb-4" density="compact">
        <v-col cols="12" sm="6">
          <v-card flat rounded="xl">
            <v-list-item title="Fr. Joby Joseph" subtitle="Vice Principal" lines="two">
              <template #prepend>
                <v-icon>mdi-account-tie-outline</v-icon>
              </template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card flat rounded="xl">
            <v-list-item title="Dr. Medari Janai Tham" subtitle="Associate Professor" lines="two">
              <template #prepend>
                <v-icon>mdi-account-tie-outline</v-icon>
              </template>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>

      <div class="text-overline text-medium-emphasis px-1 mb-2">Students</div>
      <v-row class="mb-4" density="compact">
        <v-col cols="12" sm="6">
          <v-card flat rounded="xl">
            <v-list-item title="Constantine Kharsyntiew" subtitle="Content research" lines="two">
              <template #prepend>
                <v-icon>mdi-account-edit-outline</v-icon>
              </template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card flat rounded="xl">
            <v-list-item title="Lawanbiang Kshiar" subtitle="Content research" lines="two">
              <template #prepend>
                <v-icon>mdi-account-edit-outline</v-icon>
              </template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card flat rounded="xl">
            <v-list-item title="Markordor Sohtun" subtitle="Content research" lines="two">
              <template #prepend>
                <v-icon>mdi-account-edit-outline</v-icon>
              </template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card flat rounded="xl">
            <v-list-item
              title="Vivian Alexander L Nonglait"
              subtitle="Software development"
              lines="two"
            >
              <template #prepend>
                <v-icon>mdi-code-braces</v-icon>
              </template>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
