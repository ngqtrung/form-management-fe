import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    access_token: localStorage.getItem("access_token") || null,
    user: JSON.parse(localStorage.getItem("user") || "null"),
  }),

  getters: {
    isAuthenticated: (state) => !!state.access_token,
    roles: (state) => state.user?.roles || [],
    isAdmin: (state) => state.user?.roles?.includes("admin") || false,
  },

  actions: {
    signed_in(data) {
      this.access_token = data.access_token;
      this.user = data.user;
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    },

    signed_out() {
      this.access_token = null;
      this.user = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    },
  },
});
