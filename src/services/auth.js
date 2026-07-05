import Service from "./base";

class AuthService extends Service {
  login({ email, password }) {
    return this.do_request("/api/auth/login", { method: "post", payload: { email, password } });
  }

  refresh(refresh_token) {
    return this.do_request("/api/auth/refresh", { method: "post", payload: { refresh_token } });
  }

  logout() {
    return this.do_request("/api/auth/logout", { method: "post" });
  }
}

export default AuthService;
