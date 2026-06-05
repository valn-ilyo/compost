<!-- View -- docs layout with tab navigation, desktop sidebar, and mobile chip nav -->
<script setup lang="ts">
import { computed, nextTick, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import DocsAppBar from '@/components/docs/DocsAppBar.vue'
import DocsSidebar from '@/components/docs/DocsSidebar.vue'
import GuideView from '@/components/docs/GuideTab.vue'
import MethodologyView from '@/components/docs/MethodologyTab.vue'
import CreditsView from '@/components/docs/CreditsTab.vue'
import { guideNav, methodologyNav, creditsNav } from '@/data/docs-nav'

type DocTab = 'guide' | 'methodology' | 'credits'

const route = useRoute()
const router = useRouter()
const { mdAndUp } = useDisplay()

const activeTab = computed(() => route.params.tab as DocTab)

const navForTab = computed(() => {
  switch (activeTab.value) {
    case 'methodology':
      return methodologyNav
    case 'credits':
      return creditsNav
    default:
      return guideNav
  }
})

const sectionByTab = reactive<Record<DocTab, string>>({
  guide: guideNav[0]?.id ?? 'overview',
  methodology: methodologyNav[0]?.id ?? 'overview',
  credits: creditsNav[0]?.id ?? 'team',
})

const activeSection = computed({
  get: () => sectionByTab[activeTab.value],
  set: (v: string) => {
    sectionByTab[activeTab.value] = v
  },
})

watch(activeSection, async () => {
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'instant' })
})

function onTabChange(tab: unknown) {
  router.push(`/docs/${tab as DocTab}`)
}

async function onDocsNavigate(payload: { tab: DocTab; section: string }) {
  const { tab, section } = payload
  sectionByTab[tab] = section
  await router.push(`/docs/${tab}`)
}
</script>

<template>
  <DocsAppBar @navigate="onDocsNavigate">
    <template #tabs>
      <VTabs :model-value="activeTab" color="on-primary" grow @update:model-value="onTabChange">
        <VTab rounded="0" value="guide">Guide</VTab>
        <VTab rounded="0" value="methodology">Methodology</VTab>
        <VTab rounded="0" value="credits">Credits</VTab>
      </VTabs>
    </template>
  </DocsAppBar>

  <VNavigationDrawer v-if="mdAndUp" permanent color="secondary">
    <DocsSidebar v-model="activeSection" />
  </VNavigationDrawer>

  <VMain>
    <div ref="scrollAnchor" />
    <div v-if="!mdAndUp" class="border-b bg-secondary">
      <VChipGroup
        v-model="activeSection"
        selected-class="text-on-secondary"
        mandatory
        class="px-4"
        column
      >
        <VChip
          v-for="item in navForTab"
          :key="item.id"
          :value="item.id"
          :variant="activeSection === item.id ? 'tonal' : 'text'"
        >
          {{ item.label }}
        </VChip>
      </VChipGroup>
    </div>

    <VContainer class="pt-6 docs-content">
      <GuideView v-if="activeTab === 'guide'" :active-section="activeSection" />
      <MethodologyView v-else-if="activeTab === 'methodology'" :active-section="activeSection" />
      <CreditsView v-else-if="activeTab === 'credits'" :active-section="activeSection" />
    </VContainer>
  </VMain>
</template>
