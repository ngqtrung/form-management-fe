import Service from "./base";

class FormService extends Service {
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
}

export default FormService;
