import apiClient from "../api/apiClient";

export const AuthService = {
  async signup(name, email, password) {
    // Hits NestJS @Post('auth/signup')
    return await apiClient.post("/auth/signup", { name, email, password });
  },

  async login(email, password) {
    // Hits NestJS @Post('auth/login')
    return await apiClient.post("/auth/login", { email, password });
  },

  async forgotPassword(email) {
    return await apiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword(token, password) {
    return await apiClient.post("/auth/reset-password", { token, password });
  },

  logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.reload();
  },
};
