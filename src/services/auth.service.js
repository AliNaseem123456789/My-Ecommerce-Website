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

  logout() {
    localStorage.removeItem("token");
    window.location.reload();
  },
};
