<template>
  <q-page class="q-pa-lg">
    <div class="page-wrap">
      <div class="page-title q-mb-xs">Danh sách form</div>
      <div class="page-subtitle q-mb-md">Chọn 1 form active bên dưới để điền và gửi.</div>

      <q-banner v-if="error" rounded class="bg-red-1 text-red-9 q-mb-md" dense>
        <template v-slot:avatar><q-icon name="error" color="negative" /></template>
        {{ error }}
      </q-banner>

      <div v-if="loading" class="row q-col-gutter-md">
        <div v-for="i in 3" :key="i" class="col-12 col-md-4">
          <q-card bordered><q-card-section><q-skeleton type="text" width="60%" /><q-skeleton type="text" width="90%" /></q-card-section></q-card>
        </div>
      </div>

      <q-banner v-else-if="!forms.length" rounded class="bg-grey-2 text-grey-8">
        <template v-slot:avatar><q-icon name="inbox" color="grey-6" /></template>
        Chưa có form nào đang active.
      </q-banner>

      <div v-else class="row q-col-gutter-md">
        <div v-for="form in forms" :key="form.id" class="col-12 col-md-4">
          <q-card bordered class="full-height column">
            <q-card-section class="col">
              <div class="row items-center q-mb-xs">
                <q-icon name="description" color="primary" size="20px" class="q-mr-sm" />
                <div class="text-subtitle1 text-weight-medium">{{ form.title }}</div>
              </div>
              <div class="text-caption text-grey-7">{{ form.description || "Không có mô tả." }}</div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                color="primary"
                label="Điền form"
                icon="edit_note"
                unelevated
                :to="{ name: 'fill-form', params: { formId: form.id } }"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useServices } from "../composables/use-services";

const { formService } = useServices();
const forms = ref([]);
const error = ref("");
const loading = ref(true);

async function loadForms() {
  loading.value = true;
  const resp = await formService.list_active_forms();
  loading.value = false;

  if (resp.status !== 200) {
    error.value = resp.message || "Không tải được danh sách form.";
    return;
  }
  forms.value = resp.data;
}

onMounted(loadForms);
</script>
