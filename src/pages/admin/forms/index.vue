<template>
  <q-page class="q-pa-lg">
    <div class="page-wrap">
      <div class="page-title q-mb-xs">Quản lý Form</div>
      <div class="page-subtitle q-mb-md">Tạo, sửa, xóa form và quản lý field bên trong.</div>

      <q-banner v-if="error" rounded class="bg-red-1 text-red-9 q-mb-md" dense>
        <template v-slot:avatar><q-icon name="error" color="negative" /></template>
        {{ error }}
      </q-banner>

      <q-card bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon :name="editingId ? 'edit' : 'add_circle'" class="q-mr-xs" />
            {{ editingId ? "Sửa form" : "Tạo form mới" }}
          </div>
          <q-form @submit.prevent="save">
            <div class="row q-col-gutter-md q-mb-md">
              <q-input class="col-12 col-md-6" v-model="draft.title" label="Tên form" required maxlength="200" outlined dense />
              <q-input class="col-6 col-md-3" v-model.number="draft.order" label="Thứ tự" type="number" outlined dense />
              <q-select class="col-6 col-md-3" v-model="draft.status" label="Trạng thái" :options="['draft', 'active']" outlined dense />
            </div>
            <q-input v-model="draft.description" label="Mô tả" type="textarea" outlined dense autogrow class="q-mb-md" />
            <div class="row q-gutter-sm">
              <q-btn type="submit" color="primary" unelevated :label="editingId ? 'Cập nhật' : 'Tạo form'" :icon="editingId ? 'save' : 'add'" />
              <q-btn v-if="editingId" flat label="Hủy" @click="startCreate" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <q-card bordered>
        <q-table :rows="forms" :columns="columns" row-key="id" :pagination="{ rowsPerPage: 0 }" flat>
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                square
                dense
                :color="props.row.status === 'active' ? 'positive' : 'grey-5'"
                text-color="white"
                :icon="props.row.status === 'active' ? 'check_circle' : 'edit_note'"
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense round icon="list_alt" color="primary" :to="{ name: 'admin-form-fields', params: { formId: props.row.id } }">
                <q-tooltip>Fields</q-tooltip>
              </q-btn>
              <q-btn flat dense round icon="edit" @click="startEdit(props.row)">
                <q-tooltip>Sửa</q-tooltip>
              </q-btn>
              <q-btn flat dense round icon="delete" color="negative" @click="remove(props.row)">
                <q-tooltip>Xóa</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useQuasar } from "quasar";
import { useServices } from "../../../composables/use-services";

const { formService } = useServices();
const $q = useQuasar();
const forms = ref([]);
const error = ref("");
const editingId = ref(null);

const columns = [
  { name: "order", label: "Thứ tự", field: "order", align: "left" },
  { name: "title", label: "Tên form", field: "title", align: "left" },
  { name: "status", label: "Trạng thái", field: "status", align: "left" },
  { name: "actions", label: "Hành động", field: "actions", align: "right" },
];

const blankForm = () => ({ title: "", description: "", order: 0, status: "draft" });
const draft = reactive(blankForm());

async function loadForms() {
  error.value = "";
  const resp = await formService.list_forms({ per_page: 100 });
  if (resp.status !== 200) {
    error.value = resp.message || "Không tải được danh sách form.";
    return;
  }
  forms.value = resp.data.data;
}

function startCreate() {
  editingId.value = null;
  Object.assign(draft, blankForm());
}

function startEdit(form) {
  editingId.value = form.id;
  Object.assign(draft, { title: form.title, description: form.description, order: form.order, status: form.status });
}

async function save() {
  error.value = "";
  const resp = editingId.value
    ? await formService.update_form(editingId.value, draft)
    : await formService.create_form(draft);

  if (resp.status !== 200 && resp.status !== 201) {
    error.value = resp.message + (resp.details ? ": " + resp.details.map((d) => d.message).join(", ") : "");
    return;
  }

  $q.notify({ type: "positive", message: editingId.value ? "Đã cập nhật form." : "Đã tạo form.", icon: "check_circle" });
  startCreate();
  await loadForms();
}

function remove(form) {
  $q.dialog({
    title: "Xác nhận xóa",
    message: `Xóa form "${form.title}"? Hành động này không thể hoàn tác.`,
    persistent: true,
    ok: { label: "Xóa", color: "negative", unelevated: true },
    cancel: { label: "Hủy", flat: true },
  }).onOk(async () => {
    const resp = await formService.delete_form(form.id);
    if (resp.status !== 204) {
      error.value = resp.message || "Xóa form thất bại.";
      return;
    }
    $q.notify({ type: "positive", message: "Đã xóa form.", icon: "check_circle" });
    await loadForms();
  });
}

onMounted(loadForms);
</script>
