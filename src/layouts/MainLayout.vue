<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-icon name="dynamic_form" size="28px" class="q-mr-sm" />
        <q-toolbar-title class="text-weight-bold">Form Management</q-toolbar-title>

        <q-tabs align="right" inline-label indicator-color="white" class="text-white">
          <q-route-tab :to="{ name: 'active-forms' }" label="Form active" icon="list_alt" />
          <q-route-tab :to="{ name: 'submissions' }" label="Lịch sử submission" icon="history" />
          <q-route-tab
            v-if="authStore.isAdmin"
            :to="{ name: 'admin-forms' }"
            label="Quản lý form"
            icon="admin_panel_settings"
          />
        </q-tabs>

        <q-space />

        <q-chip
          square
          :color="authStore.isAdmin ? 'accent' : 'secondary'"
          text-color="white"
          icon="account_circle"
          class="q-mr-sm"
        >
          {{ authStore.user?.email }} · {{ authStore.roles.join(", ") }}
        </q-chip>
        <q-btn flat dense round icon="logout" @click="logout">
          <q-tooltip>Đăng xuất</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const router = useRouter();

function logout() {
  authStore.signed_out();
  router.push({ name: "login" });
}
</script>
