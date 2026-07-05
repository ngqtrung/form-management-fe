<template>
  <q-page class="q-pa-lg" v-if="form">
    <div class="page-wrap">
      <q-btn flat dense icon="arrow_back" label="Quay lại danh sách form" :to="{ name: 'admin-forms' }" class="q-mb-md" />

      <div class="page-title">Fields của form: {{ form.title }}</div>
      <div class="page-subtitle q-mb-md">Thêm/sửa/xóa các field mà nhân viên sẽ điền.</div>

      <q-banner v-if="error" rounded class="bg-red-1 text-red-9 q-mb-md" dense>
        <template v-slot:avatar><q-icon name="error" color="negative" /></template>
        {{ error }}
      </q-banner>

      <q-card bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon :name="editingId ? 'edit' : 'add_circle'" class="q-mr-xs" />
            {{ editingId ? "Sửa field" : "Thêm field mới" }}
          </div>
          <q-form @submit.prevent="save">
            <div class="row q-col-gutter-md q-mb-md">
              <q-input class="col-12 col-md-6" v-model="draft.label" label="Label" required maxlength="200" outlined dense />
              <q-select class="col-6 col-md-3" v-model="draft.type" label="Loại field" :options="fieldTypes" outlined dense>
                <template v-slot:prepend><q-icon :name="typeIcon(draft.type)" /></template>
              </q-select>
              <q-input class="col-6 col-md-3" v-model.number="draft.order" label="Thứ tự" type="number" outlined dense />
            </div>
            <q-input
              v-if="draft.type === 'select'"
              v-model="draft.optionsText"
              label="Options (phân tách bằng dấu phẩy)"
              placeholder="A, B, C"
              outlined
              dense
              class="q-mb-md"
            />
            <q-checkbox v-model="draft.required" label="Bắt buộc điền" class="q-mb-md" />
            <div class="row q-gutter-sm">
              <q-btn type="submit" color="primary" unelevated :label="editingId ? 'Cập nhật' : 'Thêm field'" :icon="editingId ? 'save' : 'add'" />
              <q-btn v-if="editingId" flat label="Hủy" @click="startCreate" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <q-card bordered>
        <q-table :rows="form.fields" :columns="columns" row-key="id" :pagination="{ rowsPerPage: 0 }" flat>
          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              <q-chip square dense color="blue-1" text-color="primary" :icon="typeIcon(props.row.type)">
                {{ props.row.type }}
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-required="props">
            <q-td :props="props">
              <q-icon :name="props.row.required ? 'check_circle' : 'remove_circle_outline'" :color="props.row.required ? 'positive' : 'grey-5'" />
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
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
import { useServices } from "../../../../composables/use-services";

const props = defineProps({ formId: { type: String, required: true } });
const { formService, fieldService } = useServices();
const $q = useQuasar();

const form = ref(null);
const error = ref("");
const editingId = ref(null);

const fieldTypes = ["text", "number", "date", "color", "select"];
const typeIcons = { text: "short_text", number: "tag", date: "event", color: "palette", select: "list" };
function typeIcon(type) {
  return typeIcons[type] || "help_outline";
}

const columns = [
  { name: "order", label: "Thứ tự", field: "order", align: "left" },
  { name: "label", label: "Label", field: "label", align: "left" },
  { name: "type", label: "Type", field: "type", align: "left" },
  { name: "required", label: "Bắt buộc", field: "required", align: "center" },
  { name: "actions", label: "Hành động", field: "actions", align: "right" },
];

const blankField = () => ({ label: "", type: "text", order: 0, required: false, optionsText: "" });
const draft = reactive(blankField());

async function loadForm() {
  error.value = "";
  const resp = await formService.get_form(props.formId);
  if (resp.status !== 200) {
    error.value = resp.message || "Không tải được form.";
    return;
  }
  form.value = resp.data;
}

function startCreate() {
  editingId.value = null;
  Object.assign(draft, blankField());
}

function startEdit(field) {
  editingId.value = field.id;
  Object.assign(draft, {
    label: field.label,
    type: field.type,
    order: field.order,
    required: field.required,
    optionsText: (field.options || []).join(", "),
  });
}

function buildPayload() {
  const payload = { label: draft.label, type: draft.type, order: draft.order, required: draft.required };
  if (draft.type === "select") {
    payload.options = draft.optionsText.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return payload;
}

async function save() {
  error.value = "";
  const payload = buildPayload();
  const resp = editingId.value
    ? await fieldService.update_field(props.formId, editingId.value, payload)
    : await fieldService.create_field(props.formId, payload);

  if (resp.status !== 200 && resp.status !== 201) {
    error.value = resp.message + (resp.details ? ": " + resp.details.map((d) => d.message).join(", ") : "");
    return;
  }

  $q.notify({ type: "positive", message: editingId.value ? "Đã cập nhật field." : "Đã thêm field.", icon: "check_circle" });
  startCreate();
  await loadForm();
}

function remove(field) {
  $q.dialog({
    title: "Xác nhận xóa",
    message: `Xóa field "${field.label}"? Hành động này không thể hoàn tác.`,
    persistent: true,
    ok: { label: "Xóa", color: "negative", unelevated: true },
    cancel: { label: "Hủy", flat: true },
  }).onOk(async () => {
    const resp = await fieldService.delete_field(props.formId, field.id);
    if (resp.status !== 204) {
      error.value = resp.message || "Xóa field thất bại.";
      return;
    }
    $q.notify({ type: "positive", message: "Đã xóa field.", icon: "check_circle" });
    await loadForm();
  });
}

onMounted(loadForm);
</script>
