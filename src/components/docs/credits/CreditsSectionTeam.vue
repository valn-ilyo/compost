<!-- Component -- credits team section, supervisors and student contributors -->
<template>
  <VRow justify="start" density="compact">
    <VCol>
      <div class="text-overline text-medium-emphasis px-1 mb-2">Supervisors</div>
      <VRow class="mb-4" density="compact">
        <VCol cols="12" sm="6">
          <VCard flat rounded="xl">
            <VListItem title="Fr. Joby Joseph" subtitle="Vice Principal" lines="two">
              <template #prepend>
                <VIcon>mdi-account-tie-outline</VIcon>
              </template>
            </VListItem>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6">
          <VCard flat rounded="xl">
            <VListItem title="Dr. Medari Janai Tham" subtitle="Associate Professor" lines="two">
              <template #prepend>
                <VIcon>mdi-account-tie-outline</VIcon>
              </template>
            </VListItem>
          </VCard>
        </VCol>
      </VRow>

      <div class="text-overline text-medium-emphasis px-1 mb-2">Students</div>
      <VRow class="mb-4" density="compact">
        <VCol cols="12" sm="6">
          <VCard flat rounded="xl">
            <VListItem title="Constantine Kharsyntiew" subtitle="Content research" lines="two">
              <template #prepend>
                <VIcon>mdi-account-edit-outline</VIcon>
              </template>
            </VListItem>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6">
          <VCard flat rounded="xl">
            <VListItem title="Lawanbiang Kshiar" subtitle="Content research" lines="two">
              <template #prepend>
                <VIcon>mdi-account-edit-outline</VIcon>
              </template>
            </VListItem>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6">
          <VCard flat rounded="xl">
            <VListItem title="Markordor Sohtun" subtitle="Content research" lines="two">
              <template #prepend>
                <VIcon>mdi-account-edit-outline</VIcon>
              </template>
            </VListItem>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6">
          <VCard flat rounded="xl">
            <VListItem
              title="Vivian Alexander L Nonglait"
              subtitle="Software development"
              lines="two"
            >
              <template #prepend>
                <VIcon>mdi-code-braces</VIcon>
              </template>
            </VListItem>
          </VCard>
        </VCol>
      </VRow>
    </VCol>
  </VRow>
</template>
