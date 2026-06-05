// Vue Router instance with hash history, auth guard, and profile completeness checks
import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '@/services/supabase.service'
import { useProfileStore } from '@/stores/profile.store'
import { useSyncStore } from '@/stores/sync.store'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAdmin?: boolean
  }
}

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      meta: { requiresAuth: true },
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        {
          meta: { requiresAuth: true },
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          meta: { requiresAuth: true },
          path: '/assessment',
          name: 'assessment',
          component: () => import('@/views/AssessmentView.vue'),
        },
        {
          meta: { requiresAuth: true },
          path: '/mastery',
          name: 'mastery',
          component: () => import('@/views/MasteryView.vue'),
        },
        {
          meta: { requiresAuth: true },
          path: '/profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue'),
        },
      ],
    },
    {
      meta: { requiresAuth: true },
      path: '/assessment/:sectionId',
      name: 'assessment-section',
      component: () => import('@/views/AssessmentSectionView.vue'),
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthView.vue'),
    },
    {
      meta: { requiresAuth: true },
      path: '/onboarding',
      name: 'profile-onboarding',
      component: () => import('@/views/ProfileOnboardingView.vue'),
    },
    {
      meta: { requiresAuth: true },
      path: '/profile/edit',
      name: 'profile-edit',
      component: () => import('@/views/ProfileEditView.vue'),
    },
    {
      path: '/docs',
      redirect: '/docs/guide',
    },
    {
      path: '/docs/:tab(guide|methodology|credits)',
      name: 'docs',
      component: () => import('@/views/DocsView.vue'),
    },
    {
      meta: { requiresAuth: true, requiresAdmin: true },
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach(async (to, _from) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isLoggedIn = !!session
  const syncStore = useSyncStore()

  // Not logged in -- redirect to /auth with ?next so the user lands back here after sign-in.
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'auth', query: { next: to.fullPath } }
  }

  // Logged in but store not hydrated yet -- send back through /auth to trigger hydration.
  if (to.meta.requiresAuth && isLoggedIn && !syncStore.isHydrated) {
    return { name: 'auth', query: { next: to.fullPath } }
  }

  // Already hydrated and trying to visit /auth -- skip the auth screen entirely.
  if (to.path.startsWith('/auth') && isLoggedIn && syncStore.isHydrated) {
    const fallback = (to.query.next as string) || '/'
    return { path: fallback }
  }

  // Logged in and hydrated -- run profile completeness checks.
  if (to.meta.requiresAuth && isLoggedIn && syncStore.isHydrated) {
    const profileStore = useProfileStore()

    // Account switch guard: persisted store belongs to a different user.
    if (profileStore.profile !== null && profileStore.profile.user_id !== session.user.id) {
      profileStore.reset()
      syncStore.isHydrated = false
      return { name: 'auth', query: { next: to.fullPath } }
    }

    // Email missing from a previous session -- re-hydrate to recover it.
    if (profileStore.userEmail === null) {
      syncStore.isHydrated = false
      return { name: 'auth', query: { next: to.fullPath } }
    }

    const profileRoutes = ['profile-onboarding', 'profile-edit']

    if (!profileStore.isComplete && !profileRoutes.includes(to.name as string)) {
      return { name: 'profile-onboarding', query: { next: to.fullPath } }
    }

    if (profileStore.isComplete && to.name === 'profile-onboarding') {
      return { path: '/' }
    }

    // Admin-only routes -- non-admins fall back to home silently.
    if (to.meta.requiresAdmin && !profileStore.profile?.is_admin) {
      return { path: '/' }
    }
  }
})

export default router
