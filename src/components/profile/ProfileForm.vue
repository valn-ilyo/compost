<!-- Component -- profile form used for onboarding and edit mode, with roll number uniqueness check -->
<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useProfileStore } from "@/stores/profile.store";
import { useNotifier } from "@/composables/useNotifier";
import { supabase } from "@/services/supabase.service";

const props = defineProps<{
  editMode?: boolean;
  disabled?: boolean;
}>();

defineEmits<{ cancel: [] }>();

const { notify } = useNotifier();
const router = useRouter();
const route = useRoute();
const profileStore = useProfileStore();

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const isValid = ref(false);
const isDobMenuOpen = ref(false);
const isGenderMenuOpen = ref(false);
const isLoading = ref(false);

const nameField = ref();
const rollField = ref();
const genderField = ref();
const dobField = ref();

const existingDob = profileStore.profile?.dob ?? "";
// Separate ref to avoid the GMT display offset that occurs when binding a
// string directly to v-date-picker's model-value.
const dobRaw = ref<Date | null>(existingDob ? new Date(existingDob) : null);

const formData = reactive({
  name: profileStore.profile?.name ?? "",
  rollNo: profileStore.profile?.roll_no ?? "",
  gender: profileStore.profile?.gender ?? (null as string | null),
  dob: existingDob,
});

const maxDob = new Date();
maxDob.setFullYear(maxDob.getFullYear() - 16); // minimum age

const genderOptions = ["Male", "Female", "Prefer not to say"];
const rules = {
  required: (v: string) => !!v || "Required",
  rollNo: (v: string) => /^[pu]\d{2}[a-z]{2,3}\d+$/i.test(v) || "Roll number not recognised.",
};

type RollCheckState = "idle" | "taken";
const rollCheckState = ref<RollCheckState>("idle");

const rollHint = {
  idle: "",
  taken: "This roll number is already registered.",
};

async function handleSubmit() {
  const { valid } = await form.value!.validate();
  if (!valid) return;

  isLoading.value = true;
  try {
    // Uniqueness check -- skip if roll number is unchanged (edit mode).
    const trimmed = formData.rollNo.trim();
    const unchanged = trimmed.toLowerCase() === (profileStore.profile?.roll_no ?? "").toLowerCase();
    if (!unchanged) {
      const { data: available } = await supabase.rpc("is_roll_no_available", {
        p_roll_no: trimmed,
      });
      if (!available) {
        rollCheckState.value = "taken";
        isLoading.value = false;
        return;
      }
      rollCheckState.value = "idle";
    }

    await profileStore.updateProfile({
      name: formData.name,
      roll_no: formData.rollNo,
      gender: formData.gender || undefined,
      dob: formData.dob || undefined,
    });
    router.push(props.editMode ? "/profile" : (route.query.next as string) || "/");
  } catch (err: unknown) {
    notify({
      message: err instanceof Error ? err.message : "Couldn't save your profile. Try again.",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}

function onDateSelect(val: Date | null) {
  dobRaw.value = val;
  formData.dob = val
    ? val.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : "";
  isDobMenuOpen.value = false;
}
</script>

<template>
  <v-form ref="form" v-model="isValid" validate-on="submit" @submit.prevent="handleSubmit">
    <v-text-field
      ref="nameField"
      v-model="formData.name"
      :rules="[rules.required]"
      :disabled="disabled || isLoading"
      label="Full Name"
      prepend-inner-icon="mdi-account-outline"
      variant="outlined"
      clearable
      class="mb-2"
      @keydown.enter.prevent="rollField?.focus()"
    />

    <v-text-field
      ref="rollField"
      v-model="formData.rollNo"
      :rules="[rules.required, rules.rollNo]"
      :disabled="disabled || isLoading"
      :hint="rollHint[rollCheckState]"
      :persistent-hint="rollCheckState === 'taken'"
      :error="rollCheckState === 'taken'"
      label="Roll No"
      prepend-inner-icon="mdi-identifier"
      variant="outlined"
      clearable
      class="mb-2"
      @input="
        formData.rollNo = formData.rollNo.toUpperCase();
        rollCheckState = 'idle';
      "
      @keydown.enter.prevent="
        genderField?.focus();
        isGenderMenuOpen = true;
      "
    />

    <v-select
      ref="genderField"
      v-model="formData.gender"
      v-model:menu="isGenderMenuOpen"
      :items="genderOptions"
      :rules="[rules.required]"
      :disabled="disabled || isLoading"
      label="Gender"
      prepend-inner-icon="mdi-gender-male-female"
      variant="outlined"
      class="mb-2"
      @update:model-value="
        dobField?.focus();
        isDobMenuOpen = true;
      "
    />

    <v-menu v-model="isDobMenuOpen" :close-on-content-click="false">
      <template #activator="{ props: activatorProps }">
        <v-text-field
          ref="dobField"
          v-bind="activatorProps"
          :model-value="formData.dob"
          :rules="[rules.required]"
          :disabled="disabled || isLoading"
          label="Date of Birth"
          prepend-inner-icon="mdi-calendar-outline"
          variant="outlined"
          readonly
          clearable
          @keydown.enter.prevent="isDobMenuOpen = true"
          @click:clear="
            formData.dob = '';
            dobRaw = null;
          "
        />
      </template>
      <v-date-picker
        :model-value="dobRaw"
        :max="maxDob"
        color="primary"
        @update:model-value="onDateSelect"
      />
    </v-menu>

    <v-card-actions v-if="editMode" class="px-0 pt-2 justify-end">
      <v-btn
        variant="text"
        color="secondary"
        class="text-none"
        :disabled="isLoading"
        @click="$emit('cancel')"
        >Cancel</v-btn
      >
      <v-btn
        :isLoading="isLoading"
        :disabled="disabled || isLoading"
        type="submit"
        color="primary"
        variant="flat"
        rounded="lg"
        class="text-none font-weight-bold"
        append-icon="mdi-check"
        >Save</v-btn
      >
    </v-card-actions>

    <v-card-actions v-else class="px-0 pt-2 justify-end">
      <v-btn
        :isLoading="isLoading"
        :disabled="disabled || isLoading"
        type="submit"
        color="primary"
        variant="flat"
        rounded="lg"
        class="text-none font-weight-bold"
        append-icon="mdi-arrow-right"
        >Continue</v-btn
      >
    </v-card-actions>
  </v-form>
</template>
