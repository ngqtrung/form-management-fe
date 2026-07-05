import axios from "axios";
import { useRouter } from "vue-router";

import { useAuthStore } from "../../stores/auth";

class RequestHandler {
  constructor(base_url) {
    this.axios = axios.create({ baseURL: base_url });
  }

  make_request_data({ method, payload, headers }) {
    if (method === "get" || method === "delete") {
      return [{ headers, params: payload || {} }];
    }
    return [payload || {}, { headers }];
  }

  async do_request({ url, method, payload, headers }) {
    const request_data = this.make_request_data({ method, payload, headers });

    const result = { status: 200, data: null, error: null, message: null };

    try {
      const response = await this.axios[method](url, ...request_data);
      result.status = response.status;
      result.data = response.data;
    } catch (error) {
      const response = error.response || {};
      result.status = response.status || 500;
      result.data = response.data || { error: "NetworkError", message: error.message };
      result.error = result.data.error;
      result.message = result.data.message;
      result.details = result.data.details;
    }
    return result;
  }
}

class Api {
  constructor({ authStore, router }) {
    this.request_handler = new RequestHandler(import.meta.env.API_URL || "http://localhost:5000");
    this.authStore = authStore;
    this.router = router;
  }

  async do_request(endpoint, { method, payload, headers }) {
    const final_headers = {
      Authorization: `Bearer ${this.authStore.access_token}`,
      ...(headers || {}),
    };

    const response = await this.request_handler.do_request({ url: endpoint, method, payload, headers: final_headers });

    if (response.status === 401) {
      this.authStore.signed_out();
      this.router.push({ name: "login" });
    }
    return response;
  }

  login({ email, password }) {
    return this.do_request("/api/auth/login", { method: "post", payload: { email, password } });
  }

  list_active_forms() {
    return this.do_request("/api/forms/active", { method: "get" });
  }

  list_forms(payload) {
    return this.do_request("/api/forms", { method: "get", payload });
  }

  create_form(payload) {
    return this.do_request("/api/forms", { method: "post", payload });
  }

  get_form(form_id) {
    return this.do_request(`/api/forms/${form_id}`, { method: "get" });
  }

  update_form(form_id, payload) {
    return this.do_request(`/api/forms/${form_id}`, { method: "put", payload });
  }

  delete_form(form_id) {
    return this.do_request(`/api/forms/${form_id}`, { method: "delete" });
  }

  create_field(form_id, payload) {
    return this.do_request(`/api/forms/${form_id}/fields`, { method: "post", payload });
  }

  update_field(form_id, field_id, payload) {
    return this.do_request(`/api/forms/${form_id}/fields/${field_id}`, { method: "put", payload });
  }

  delete_field(form_id, field_id) {
    return this.do_request(`/api/forms/${form_id}/fields/${field_id}`, { method: "delete" });
  }

  submit_form(form_id, answers) {
    return this.do_request(`/api/forms/${form_id}/submit`, { method: "post", payload: { answers } });
  }

  list_submissions(payload) {
    return this.do_request("/api/submissions", { method: "get", payload });
  }
}

export default Api;

export const use_api = () => {
  const authStore = useAuthStore();
  const router = useRouter();
  return new Api({ authStore, router });
};
