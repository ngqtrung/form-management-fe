<template>
  <q-page class="q-pa-lg" v-if="form">
    <div class="form-wrap">
      <q-btn flat dense icon="arrow_back" label="Quay lại danh sách form" :to="{ name: 'active-forms' }" class="q-mb-md" />

      <div class="page-title">{{ form.title }}</div>
      <div v-if="form.description" class="page-subtitle q-mb-md">{{ form.description }}</div>

      <q-card bordered>
      <q-card-section>
        <q-banner v-if="error" rounded class="bg-red-1 text-red-9 q-mb-md" dense>
          <template v-slot:avatar><q-icon name="error" color="negative" /></template>
          {{ error }}
        </q-banner>

        <q-form @submit.prevent="submit" class="q-gutter-md">
          <div v-for="field in form.fields" :key="field.id">
            <q-input
              v-if="field.type === 'text'"
              v-model="answers[field.id]"
              :label="fieldLabel(field)"
              :maxlength="field.validation_rules?.max_length || 200"
              outlined
              dense
              :error="!!fieldErrors[field.id]"
              :error-message="fieldErrors[field.id]"
            >
              <template v-slot:prepend><q-icon name="short_text" /></template>
            </q-input>
            <q-input
              v-else-if="field.type === 'number'"
              v-model.number="answers[field.id]"
              type="number"
              :label="fieldLabel(field)"
              :min="field.validation_rules?.min ?? 0"
              :max="field.validation_rules?.max ?? 100"
              outlined
              dense
              :error="!!fieldErrors[field.id]"
              :error-message="fieldErrors[field.id]"
            >
              <template v-slot:prepend><q-icon name="tag" /></template>
            </q-input>
            <q-input
              v-else-if="field.type === 'date'"
              v-model="answers[field.id]"
              type="date"
              :label="fieldLabel(field)"
              outlined
              dense
              :error="!!fieldErrors[field.id]"
              :error-message="fieldErrors[field.id]"
            >
              <template v-slot:prepend><q-icon name="event" /></template>
            </q-input>
            <div v-else-if="field.type === 'color'">
              <div class="text-caption text-grey-8 q-mb-xs">{{ fieldLabel(field) }}</div>
              <div class="row items-center q-gutter-sm">
                <input v-model="answers[field.id]" type="color" class="color-input" />
                <span class="text-caption text-grey-7">{{ answers[field.id] }}</span>
              </div>
              <div v-if="fieldErrors[field.id]" class="text-negative text-caption q-mt-xs">
                {{ fieldErrors[field.id] }}
              </div>
            </div>
            <q-select
              v-else-if="field.type === 'select'"
              v-model="answers[field.id]"
              :label="fieldLabel(field)"
              :options="field.options || []"
              outlined
              dense
              :error="!!fieldErrors[field.id]"
              :error-message="fieldErrors[field.id]"
            >
              <template v-slot:prepend><q-icon name="list" /></template>
            </q-select>
          </div>

          <q-btn
            type="submit"
            color="primary"
            label="Gửi form"
            icon-right="send"
            unelevated
            :loading="submitting"
          />
        </q-form>
      </q-card-section>
      </q-card>
    </div>
  </q-page>
  <q-page class="q-pa-lg flex flex-center" v-else-if="error">
    <q-banner rounded class="bg-red-1 text-red-9" style="max-width: 480px">{{ error }}</q-banner>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { use_api } from "../../../composables/api";

const props = defineProps({ formId: { type: String, required: true } });
const api = use_api();
const router = useRouter();
const $q = useQuasar();

const form = ref(null);
const answers = reactive({});
const error = ref("");
const fieldErrors = reactive({});
const submitting = ref(false);

function fieldLabel(field) {
  return field.required ? `${field.label} *` : field.label;
}

async function loadForm() {
  error.value = "";
  // Employee chỉ có quyền forms:view_active, nên lấy form qua /api/forms/active
  // thay vì GET /api/forms/:id (yêu cầu forms:view_all).
  const resp = await api.list_active_forms();
  if (resp.status !== 200) {
    error.value = resp.message || "Không tải được form.";
    return;
  }

  const found = resp.data.find((f) => f.id === props.formId);
  if (!found) {
    error.value = "Không tìm thấy form hoặc form không còn active.";
    return;
  }
  form.value = found;
  for (const field of found.fields) {
    answers[field.id] = field.type === "color" ? "#000000" : "";
  }
}

async function submit() {
  error.value = "";
  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key]);
  submitting.value = true;
  const resp = await api.submit_form(props.formId, { ...answers });
  submitting.value = false;

  if (resp.status !== 201) {
    error.value = resp.message || "Submit thất bại.";
    if (resp.details) {
      for (const detail of resp.details) {
        fieldErrors[detail.field_id] = detail.message;
      }
    }
    return;
  }

  $q.notify({ type: "positive", message: "Gửi form thành công!", icon: "check_circle" });
  router.push({ name: "submissions" });
}

onMounted(loadForm);
</script>

<style scoped>
.color-input {
  width: 48px;
  height: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 2px;
  cursor: pointer;
}
</style>
