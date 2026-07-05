import axios from "axios";

class Service {
  constructor({ authStore, router }) {
    this.request_handler = axios.create({
      baseURL: import.meta.env.API_URL || "http://localhost:5000",
    });
    this.authStore = authStore;
    this.router = router;
  }

  _auth_header() {
    return this.authStore?.access_token ? { Authorization: `Bearer ${this.authStore.access_token}` } : {};
  }

  _request_args({ method, payload, headers }) {
    const full_headers = { ...this._auth_header(), ...(headers || {}) };
    if (method === "get" || method === "delete") {
      return [{ headers: full_headers, params: payload || {} }];
    }
    return [payload || {}, { headers: full_headers }];
  }

  async do_request(endpoint, { method, payload, headers }) {
    const args = this._request_args({ method, payload, headers });
    const result = { status: 200, data: null, error: null, message: null };

    try {
      const response = await this.request_handler[method](endpoint, ...args);
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

    if (result.status === 401) {
      this.authStore.signed_out();
      this.router.push({ name: "login" });
    }

    return result;
  }
}

export default Service;
