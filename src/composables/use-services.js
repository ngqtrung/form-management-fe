import { useRouter } from "vue-router";

import { useAuthStore } from "../stores/auth";
import { AuthService, FormService, FieldService, SubmissionService } from "../services";

export function useServices() {
  const authStore = useAuthStore();
  const router = useRouter();
  const ctx = { authStore, router };

  return {
    authService: new AuthService(ctx),
    formService: new FormService(ctx),
    fieldService: new FieldService(ctx),
    submissionService: new SubmissionService(ctx),
  };
}
