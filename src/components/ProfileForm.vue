<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useProfileStore } from "@/stores/profile";
import { useNotifier } from "@/composables/useNotifier";

const props = defineProps<{
  editMode?: boolean;
}>();

const emit = defineEmits<{ cancel: [] }>();

const { notify } = useNotifier();
const router = useRouter();
const route = useRoute();
const profileStore = useProfileStore();

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const isValid = ref(false);
const dobMenu = ref(false);
const genderMenu = ref(false);
const loading = ref(false);

const nameField = ref();
const rollField = ref();
const genderField = ref();
const dobField = ref();

const existingDob = profileStore.profile?.dob ?? "";
const dobRaw = ref<Date | null>(existingDob ? new Date(existingDob) : null);

const formData = reactive({
  name: profileStore.profile?.name ?? "",
  rollNo: profileStore.profile?.roll_no ?? "",
  gender: profileStore.profile?.gender ?? (null as string | null),
  dob: existingDob,
});

const genderOptions = ["Male", "Female", "Prefer not to say"];
const rules = { required: (v: string) => !!v || "Required" };

async function handleSubmit() {
  const { valid } = await form.value!.validate();
  if (!valid) return;

  loading.value = true;
  try {
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
    loading.value = false;
  }
}

function onDateSelect(val: Date | null) {
  dobRaw.value = val;
  formData.dob = val
    ? val.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : "";
  dobMenu.value = false;
}
</script>

<template>
  <v-form ref="form" v-model="isValid" validate-on="submit" @submit.prevent="handleSubmit">
    <v-text-field
      ref="nameField"
      v-model="formData.name"
      :rules="[rules.required]"
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
      :rules="[rules.required]"
      label="Roll No"
      prepend-inner-icon="mdi-identifier"
      variant="outlined"
      clearable
      class="mb-2"
      @keydown.enter.prevent="genderField?.focus(); genderMenu = true"
    />

    <v-select
      ref="genderField"
      v-model="formData.gender"
      v-model:menu="genderMenu"
      :items="genderOptions"
      :rules="[rules.required]"
      label="Gender"
      prepend-inner-icon="mdi-gender-male-female"
      variant="outlined"
      class="mb-2"
      @update:model-value="dobField?.focus(); dobMenu = true"
    />

    <v-menu v-model="dobMenu" :close-on-content-click="false">
      <template #activator="{ props: activatorProps }">
        <v-text-field
          ref="dobField"
          v-bind="activatorProps"
          :model-value="formData.dob"
          :rules="[rules.required]"
          label="Date of Birth"
          prepend-inner-icon="mdi-calendar-outline"
          variant="outlined"
          readonly
          clearable
          @keydown.enter.prevent="dobMenu = true"
          @click:clear="
            formData.dob = '';
            dobRaw = null;
          "
        />
      </template>
      <v-date-picker :model-value="dobRaw" color="primary" @update:model-value="onDateSelect" />
    </v-menu>

    <v-card-actions v-if="editMode" class="px-0 pt-2 justify-end">
      <v-btn
        variant="text"
        color="secondary"
        class="text-none"
        @click="$emit('cancel')"
      >Cancel</v-btn>
      <v-btn
        :loading="loading"
        type="submit"
        color="primary"
        variant="flat"
        rounded="lg"
        class="text-none font-weight-bold"
        append-icon="mdi-check"
      >Save</v-btn>
    </v-card-actions>

    <v-card-actions v-else class="px-0 pt-2 justify-end">
      <v-btn
        :loading="loading"
        type="submit"
        color="primary"
        variant="flat"
        rounded="lg"
        class="text-none font-weight-bold"
        append-icon="mdi-arrow-right"
      >Continue</v-btn>
    </v-card-actions>
  </v-form>
</template>