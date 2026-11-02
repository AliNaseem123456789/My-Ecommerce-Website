import axios from "axios";

const baseURL = "http://localhost:3000/api/v1";
// const baseURL = "https://ecommerce-website-backend-k4vc.onrender.com/api/v1";

const apiClient = axios.create({
  baseURL,
  timeout: 60000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL,
  timeout: 60000,
  withCredentials: true,
});

function currentStore() {
  if (sessionStorage.getItem("token")) return sessionStorage;
  return localStorage;
}

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config || {};
    const url = original.url || "";
    const skip =
      original._retry ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/login") ||
      url.includes("/auth/signup");
    if (error.response?.status !== 401 || skip) {
      console.error("API Error:", error.response?.data || error.message);
      throw error;
    }
    original._retry = true;
    if (!refreshPromise) {
      refreshPromise = refreshClient
        .post("/auth/refresh")
        .finally(() => {
          refreshPromise = null;
        });
    }
    try {
      const { data } = await refreshPromise;
      currentStore().setItem("token", data.access_token);
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${data.access_token}`;
      return apiClient(original);
    } catch (refreshError) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      if (!window.location.pathname.includes("login")) {
        window.location.assign("/login-required");
      }
      throw refreshError;
    }
  },
);

export default apiClient;
