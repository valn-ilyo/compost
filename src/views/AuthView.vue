<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { supabase } from "@/services/supabase";
import { useNotifier } from "@/composables/useNotifier";
import { useSyncStore } from "@/stores/sync";
import { useProfileStore } from "@/stores/profile";
import { useAssessmentStore } from "@/stores/assessment";
import { useMasteryStore } from "@/stores/mastery";
import { resetAllStores } from "@/composables/useLogout";

const { notify } = useNotifier();
const router = useRouter();
const route = useRoute();

const syncStore = useSyncStore();
const profileStore = useProfileStore();
const assessmentStore = useAssessmentStore();
const masteryStore = useMasteryStore();

type AuthState = "login" | "loading" | "error";

const authState = ref<AuthState>("login");
const errorEmail = ref<string | null>(null);
const sessionExpiredMsg = ref("");
const googleLoading = ref(false);
const privacyDialog = ref(false);

// ─── Login ────────────────────────────────────────────────────────────────────

const loginWithGoogle = async () => {
  sessionExpiredMsg.value = "";
  googleLoading.value = true;
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/compost/",
      },
    });
    if (error) {
      googleLoading.value = false;
      notify({ message: `Login failed: ${error.message}`, color: "error" });
    }
    // success: browser navigating away, leave googleLoading true
  } catch (err) {
    googleLoading.value = false;
    notify({
      message: err instanceof Error ? err.message : "An unexpected error occurred",
      color: "error",
    });
  }
};

// ─── Hydration ────────────────────────────────────────────────────────────────

async function runHydration() {
  authState.value = "loading";

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      await supabase.auth.signOut();
      sessionExpiredMsg.value = "Session expired. Sign in again.";
      authState.value = "login";
      return;
    }

    const userId = session.user.id;
    const email = session.user.email ?? undefined;

    // Reset all stores before hydrating to prevent stale state from a previous session.
    resetAllStores();

    syncStore.beginHydrating();
    await Promise.all([
      profileStore.fetchProfile(userId, email),
      assessmentStore.hydrateFromSupabase(userId),
      masteryStore.hydrateFromSupabase(userId),
    ]);

    syncStore.setHydrated();
    // Reconcile after setHydrated() so enqueue() is live.
    masteryStore.reconcileStreaks();

    const next = (route.query.next as string) || "/";
    await router.push(next);
  } catch {
    syncStore.endHydrating();
    const {
      data: { user },
    } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    errorEmail.value = user?.email ?? null;
    authState.value = "error";
  }
}

async function retryHydration() {
  await runHydration();
}

async function switchAccount() {
  await supabase.auth.signOut();
  errorEmail.value = null;
  authState.value = "login";
}

// ─── On mount ─────────────────────────────────────────────────────────────────

onMounted(async () => {
  if (import.meta.env.DEV && route.query.preview) {
    authState.value = route.query.preview as AuthState;
    if (route.query.preview === "error") {
      const {
        data: { user },
      } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      errorEmail.value = user?.email ?? "preview@example.com";
    }
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session && !syncStore.isHydrated) {
    await runHydration();
  }
});
</script>

<template>
  <v-sheet
    color="background"
    class="d-flex flex-column align-center justify-center w-100 px-2"
    style="min-height: 100dvh"
  >
    <!-- ── Loading state ──────────────────────────────────────────────────── -->
    <template v-if="authState === 'loading'">
      <v-progress-circular indeterminate color="primary" size="48" class="mb-6" />
      <p class="text-body-1 text-medium-emphasis">Setting up your account…</p>
    </template>

    <!-- ── Error state ────────────────────────────────────────────────────── -->
    <template v-else-if="authState === 'error'">
      <v-card
        class="w-100 w-sm-75 w-md-50 w-lg-33 pa-2 text-center"
        color="background"
        elevation="0"
      >
        <v-icon icon="mdi-cloud-off-outline" size="72" color="primary" class="mb-6" />

        <v-card-title class="text-body-1 font-weight-bold text-wrap">
          Couldn't load your data.
        </v-card-title>

        <v-card-actions class="d-flex flex-column align-center justify-center gap-2">
          <v-btn
            color="primary"
            rounded="lg"
            size="large"
            flat
            class="text-none"
            @click="retryHydration"
            prepend-icon="mdi-reload"
          >
            Retry
          </v-btn>
          <v-btn
            variant="text"
            color="secondary"
            size="small"
            class="text-none"
            @click="switchAccount"
          >
            <span class="text-medium-emphasis">Not {{ errorEmail }}?</span>
            <span class="ms-1 font-weight-bold text-primary">Switch account</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>

    <!-- ── Login state ────────────────────────────────────────────────────── -->
    <template v-else>
      <v-card
        v-motion
        :initial="{ opacity: 0, y: 24 }"
        :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }"
        class="text-onSecondaryContainer w-100 w-sm-75 w-md-50 w-lg-33 pa-2 text-center"
        color="background"
        elevation="0"
      >
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.7, rotate: -15 }"
          :enter="{
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: { type: 'spring', stiffness: 260, damping: 22 },
          }"
          style="display: inline-block"
        >
          <v-icon icon="custom:sac" size="160" />
        </div>

        <v-card-title
          v-motion
          :initial="{ opacity: 0, y: 12 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 80 },
          }"
          class="text-primary text-headline-medium font-weight-bold"
          >Compost</v-card-title
        >

        <v-card-text
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 22, delay: 140 },
          }"
        >
          Find out what your daily habits actually cost the planet. Answer questions across
          transport, food, energy, and more. See where you stand and where small changes would
          matter most.
        </v-card-text>

        <p v-if="sessionExpiredMsg" class="text-body-2 text-error px-4 pb-2">
          {{ sessionExpiredMsg }}
        </p>

        <v-card-actions class="d-flex flex-column align-center justify-center">
          <v-btn
            text="Continue with Google"
            class="text-none rounded-xl border border-thin border-opacity-100"
            hover
            color="background"
            variant="flat"
            elevation="1"
            :loading="googleLoading"
            :disabled="googleLoading"
            @click="loginWithGoogle"
          >
            <template #prepend>
              <v-icon>
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  style="display: block"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </v-icon>
            </template>
          </v-btn>
        </v-card-actions>

        <v-btn
          variant="text"
          color="secondary"
          size="small"
          class="mt-2 mx-auto d-block text-none"
          @click="privacyDialog = true"
          >About your data</v-btn
        >
      </v-card>
    </template>

    <!-- ── Privacy dialog ────────────────────────────────────────────────── -->
    <v-dialog v-model="privacyDialog" max-width="360">
      <v-card rounded="xl">
        <v-card-text class="text-body-2 text-medium-emphasis pt-5">
          <p class="mb-2">
            Your answers and habit activity are stored on a remote server so your progress syncs
            across devices.
          </p>
          <p class="mb-2">
            Admins can see anonymised, aggregated statistics. No one can read your individual
            responses.
          </p>
          <p>You can delete your data at any time from your profile.</p>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn
            variant="flat"
            color="primary"
            rounded="lg"
            flex="1"
            class="text-none"
            @click="privacyDialog = false"
          >
            Done
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>
