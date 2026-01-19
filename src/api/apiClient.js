import axios from "axios";

const apiClient = axios.create({
  // baseURL: "http://localhost:3000/api/v1",
  baseURL:
    "https://ecommerce-website-backend-production-70d5.up.railway.app/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  },
);

export default apiClient;
