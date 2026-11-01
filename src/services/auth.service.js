import apiClient from "../api/apiClient";

export const AuthService = {
  async signup(name, email, password, staySignedIn) {
    return await apiClient.post("/auth/signup", {
      name,
      email,
      password,
      staySignedIn,
    });
  },

  async login(email, password, staySignedIn) {
    return await apiClient.post("/auth/login", { email, password, staySignedIn });
  },

  async forgotPassword(email) {
    return await apiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword(token, password) {
    return await apiClient.post("/auth/reset-password", { token, password });
  },

  sessions: () => apiClient.get("/auth/sessions"),
  revokeSession: (id) => apiClient.delete(`/auth/sessions/${id}`),

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      /* the access token may already be gone */
    }
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  },
};
