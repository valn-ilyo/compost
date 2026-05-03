import { createRouter, createWebHashHistory } from "vue-router";
import { supabase } from "@/lib/supabaseClient.ts";
import { useProfileStore } from "@/stores/profile";

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
  }
}

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    {
      meta: { requiresAuth: true },
      path: "/",
      component: () => import("@/layouts/AppLayout.vue"),
      children: [
        {
          meta: { requiresAuth: true },
          path: "",
          name: "home",
          component: () => import("@/views/HomeView.vue"),
        },
        {
          meta: { requiresAuth: true },
          path: "/assessment",
          name: "assessment",
          component: () => import("@/views/AssessmentView.vue"),
        },
        {
          meta: { requiresAuth: true },
          path: "/mastery",
          name: "mastery",
          component: () => import("@/views/MasteryView.vue"),
        },
        {
          meta: { requiresAuth: true },
          path: "/learn",
          name: "learn",
          component: () => import("@/views/LearnView.vue"),
        },
        {
          meta: { requiresAuth: true },
          path: "/profile",
          name: "profile",
          component: () => import("@/views/ProfileView.vue"),
        },
        {
          meta: { requiresAuth: true },
          path: "/settings",
          name: "settings",
          component: () => import("@/views/SettingsView.vue"),
        },
      ],
    },
    {
      meta: { requiresAuth: true },
      path: "/assessment/:sectionId",
      name: "assessment-section",
      component: () => import("@/views/AssessmentSectionView.vue"),
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("@/views/AuthView.vue"),
    },
    {
      meta: { requiresAuth: true },
      path: "/onboarding",
      name: "profile-onboarding",
      component: () => import("@/views/ProfileOnboardingView.vue"),
    },
    {
      meta: { requiresAuth: true },
      path: "/profile/edit",
      name: "profile-edit",
      component: () => import("@/views/ProfileEditView.vue"),
    },
    ...(import.meta.env.DEV
      ? [{ path: "/dev", name: "dev", component: () => import("@/views/DevView.vue") }]
      : []),
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
    },
  ],
});

router.beforeEach(async (to, _from) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  if (to.path.startsWith("/auth") && isLoggedIn) {
    const fallback = (to.query.next as string) || "/";
    return { path: fallback };
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: "auth", query: { next: to.fullPath } };
  }

  if (to.meta.requiresAuth && isLoggedIn) {
    const profileStore = useProfileStore();
    const userId = session.user.id;

    if (profileStore.profile !== null && profileStore.profile.id !== userId) {
      profileStore.reset();
    }

    if (profileStore.profile === null && !profileStore.loading) {
      await profileStore.fetchProfile(userId);
    }

    const profileRoutes = ["profile-onboarding", "profile-edit"];

    // Incomplete profile → redirect to onboarding (unless already on a profile route)
    if (!profileStore.isComplete && !profileRoutes.includes(to.name as string)) {
      return { name: "profile-onboarding", query: { next: to.fullPath } };
    }

    // Complete profile → prevent access to onboarding
    if (profileStore.isComplete && to.name === "profile-onboarding") {
      return { path: "/" };
    }
  }
});

export default router;
