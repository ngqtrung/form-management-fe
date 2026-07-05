<template>
  <q-page class="q-pa-lg">
    <div class="page-wrap">
      <div class="page-title q-mb-xs">Lịch sử submission</div>
      <div class="page-subtitle q-mb-md">
        {{ authStore.isAdmin ? "Toàn bộ submission của mọi người dùng." : "Các submission bạn đã gửi." }}
      </div>

      <q-banner v-if="error" rounded class="bg-red-1 text-red-9 q-mb-md" dense>
        <template v-slot:avatar><q-icon name="error" color="negative" /></template>
        {{ error }}
      </q-banner>

      <q-card bordered>
      <q-table
        :rows="submissions"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        @request="onRequest"
        :loading="loading"
        flat
      >
        <template v-slot:body="props">
          <q-tr :props="props" class="cursor-pointer" @click="toggle(props.row)">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <template v-if="col.name === 'actions'">
                <q-icon :name="expandedId === props.row.id ? 'expand_less' : 'expand_more'" color="grey-7" />
              </template>
              <template v-else-if="col.name === 'form_title'">
                <q-icon name="description" color="primary" size="18px" class="q-mr-xs" />
                {{ col.value }}
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
          <q-tr v-if="expandedId === props.row.id">
            <q-td :colspan="columns.length" class="bg-grey-1">
              <q-list dense>
                <q-item v-for="answer in props.row.answers" :key="answer.id">
                  <q-item-section>
                    <q-item-label>{{ answer.field_label }}</q-item-label>
                    <q-item-label caption>{{ answer.field_type }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <span class="text-weight-medium">{{ answer.value ?? "(trống)" }}</span>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width text-center text-grey-6 q-pa-lg">
            <q-icon name="inbox" size="32px" class="q-mb-sm" />
            <div>Chưa có submission nào.</div>
          </div>
        </template>
      </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useServices } from "../../composables/use-services";

const authStore = useAuthStore();
const { submissionService } = useServices();

const submissions = ref([]);
const error = ref("");
const loading = ref(false);
const expandedId = ref(null);
const pagination = ref({ page: 1, rowsPerPage: 20, rowsNumber: 0 });

const columns = [
  { name: "form_title", label: "Form", field: "form_title", align: "left" },
  ...(authStore.isAdmin ? [{ name: "submitted_by_email", label: "Người nộp", field: "submitted_by_email", align: "left" }] : []),
  {
    name: "created_at",
    label: "Thời gian",
    field: "created_at",
    align: "left",
    format: (val) => new Date(val).toLocaleString(),
  },
  { name: "actions", label: "", field: "actions", align: "right" },
];

function toggle(row) {
  expandedId.value = expandedId.value === row.id ? null : row.id;
}

async function load(page = 1) {
  error.value = "";
  loading.value = true;
  const resp = await submissionService.list_submissions({ page, per_page: pagination.value.rowsPerPage });
  loading.value = false;

  if (resp.status !== 200) {
    error.value = resp.message || "Không tải được lịch sử submission.";
    return;
  }

  submissions.value = resp.data.data;
  pagination.value.page = resp.data.meta.page;
  pagination.value.rowsNumber = resp.data.meta.total;
}

function onRequest(requestProp) {
  pagination.value.rowsPerPage = requestProp.pagination.rowsPerPage;
  load(requestProp.pagination.page);
}

onMounted(() => load(1));
</script>
