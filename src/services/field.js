import Service from "./base";

class FieldService extends Service {
  create_field(form_id, payload) {
    return this.do_request(`/api/forms/${form_id}/fields`, { method: "post", payload });
  }

  update_field(form_id, field_id, payload) {
    return this.do_request(`/api/forms/${form_id}/fields/${field_id}`, { method: "put", payload });
  }

  delete_field(form_id, field_id) {
    return this.do_request(`/api/forms/${form_id}/fields/${field_id}`, { method: "delete" });
  }
}

export default FieldService;
