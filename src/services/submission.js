import Service from "./base";

class SubmissionService extends Service {
  submit_form(form_id, answers) {
    return this.do_request(`/api/forms/${form_id}/submit`, { method: "post", payload: { answers } });
  }

  list_submissions(payload) {
    return this.do_request("/api/submissions", { method: "get", payload });
  }
}

export default SubmissionService;
