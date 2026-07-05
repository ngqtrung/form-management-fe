<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center login-bg">
        <q-card style="width: 400px" class="q-pa-sm" bordered>
          <q-card-section class="text-center q-pb-none">
            <q-avatar size="56px" color="primary" text-color="white" icon="dynamic_form" class="q-mb-sm" />
            <div class="text-h6">Form Management</div>
            <div class="page-subtitle">Đăng nhập để tiếp tục</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="submit" class="q-gutter-md">
              <q-input
                v-model="email"
                type="email"
                label="Email"
                required
                outlined
                dense
                :rules="[(val) => !!val || 'Bắt buộc nhập email']"
              >
                <template v-slot:prepend><q-icon name="mail" /></template>
              </q-input>
              <q-input
                v-model="password"
                type="password"
                label="Mật khẩu"
                required
                outlined
                dense
                :rules="[(val) => !!val || 'Bắt buộc nhập mật khẩu']"
              >
                <template v-slot:prepend><q-icon name="lock" /></template>
              </q-input>

              <q-banner v-if="error" rounded class="bg-red-1 text-red-9" dense>
                <template v-slot:avatar><q-icon name="error" color="negative" /></template>
                {{ error }}
              </q-banner>

              <q-btn
                type="submit"
                color="primary"
                label="Đăng nhập"
                icon-right="login"
                :loading="loading"
                unelevated
                class="full-width"
                size="md"
              />
            </q-form>

            <q-separator class="q-my-md" />

            <div class="text-caption text-grey-7">
              <q-icon name="info" size="16px" class="q-mr-xs" />
              Tài khoản demo: <strong>admin@example.com</strong> / Admin@123 (admin) hoặc
              <strong>employee@example.com</strong> / Employee@123 (employee)
            </div>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { useServices } from "../../composables/use-services";

const authStore = useAuthStore();
const { authService } = useServices();
const router = useRouter();
const route = useRoute();

const email = ref("admin@example.com");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function submit() {
  error.value = "";
  loading.value = true;
  const resp = await authService.login({ email: email.value, password: password.value });
  loading.value = false;

  if (resp.status !== 200) {
    error.value = resp.message || "Đăng nhập thất bại.";
    return;
  }

  authStore.signed_in(resp.data);
  router.push(route.query.redirect || { name: "active-forms" });
}
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #eef2ff 0%, #f4f6fb 100%);
}
</style>
