<script setup lang="ts">
import { computed, nextTick, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import DocsAppBar from "@/components/docs/DocsAppBar.vue";
import DocsSidebar from "@/components/docs/DocsSidebar.vue";
import GuideView from "@/components/docs/GuideTab.vue";
import MethodologyView from "@/components/docs/MethodologyTab.vue";
import CreditsView from "@/components/docs/CreditsTab.vue";
import { guideNav, methodologyNav, creditsNav } from "@/data/docs-nav";

type DocTab = "guide" | "methodology" | "credits";

const route = useRoute();
const router = useRouter();
const { mdAndUp } = useDisplay();

const activeTab = computed(() => route.params.tab as DocTab);

const navForTab = computed(() => {
  switch (activeTab.value) {
    case "methodology":
      return methodologyNav;
    case "credits":
      return creditsNav;
    default:
      return guideNav;
  }
});

const sectionByTab = reactive<Record<DocTab, string>>({
  guide: guideNav[0]?.id ?? "overview",
  methodology: methodologyNav[0]?.id ?? "overview",
  credits: creditsNav[0]?.id ?? "team",
});

const activeSection = computed({
  get: () => sectionByTab[activeTab.value],
  set: (v: string) => {
    sectionByTab[activeTab.value] = v;
  },
});

watch(activeSection, async () => {
  await nextTick();
  window.scrollTo({ top: 0, behavior: "instant" });
});

function onTabChange(tab: unknown) {
  router.push(`/docs/${tab as DocTab}`);
}

async function onDocsNavigate(payload: { tab: DocTab; section: string }) {
  const { tab, section } = payload;
  sectionByTab[tab] = section;
  await router.push(`/docs/${tab}`);
}
</script>

<template>
  <DocsAppBar @navigate="onDocsNavigate">
    <template #tabs>
      <v-tabs :model-value="activeTab" color="on-primary" @update:model-value="onTabChange" grow>
        <v-tab rounded="0" value="guide">Guide</v-tab>
        <v-tab rounded="0" value="methodology">Methodology</v-tab>
        <v-tab rounded="0" value="credits">Credits</v-tab>
      </v-tabs>
    </template>
  </DocsAppBar>

  <v-navigation-drawer v-if="mdAndUp" permanent color="secondary">
    <DocsSidebar v-model="activeSection" />
  </v-navigation-drawer>

  <v-main>
    <div ref="scrollAnchor" />
    <div v-if="!mdAndUp" class="border-b bg-secondary">
      <v-chip-group
        v-model="activeSection"
        selected-class="text-on-secondary"
        mandatory
        class="px-4"
        column
      >
        <v-chip
          v-for="item in navForTab"
          :key="item.id"
          :value="item.id"
          :variant="activeSection === item.id ? 'tonal' : 'text'"
        >
          {{ item.label }}
        </v-chip>
      </v-chip-group>
    </div>

    <v-container class="pt-6 docs-content">
      <GuideView v-if="activeTab === 'guide'" :active-section="activeSection" />
      <MethodologyView v-else-if="activeTab === 'methodology'" :active-section="activeSection" />
      <CreditsView v-else-if="activeTab === 'credits'" :active-section="activeSection" />
    </v-container>
  </v-main>
</template>
