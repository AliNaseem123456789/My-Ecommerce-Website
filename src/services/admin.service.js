import apiClient from "../api/apiClient";

export const adminService = {
  summary: () => apiClient.get("/admin/summary"),
  products: () => apiClient.get("/admin/products"),
  createProduct: (body) => apiClient.post("/admin/products", body),
  updateProduct: (id, body) => apiClient.patch(`/admin/products/${id}`, body),
  deleteProduct: (id) => apiClient.delete(`/admin/products/${id}`),
  uploadImage: (id, dataUrl) =>
    apiClient.post(`/admin/products/${id}/image`, { dataUrl }),
  orders: (status) =>
    apiClient.get("/admin/orders", { params: status ? { status } : {} }),
  updateOrderStatus: (id, status) =>
    apiClient.patch(`/admin/orders/${id}/status`, { status }),
  customers: () => apiClient.get("/admin/customers"),
  reviews: () => apiClient.get("/admin/reviews"),
  deleteReview: (id) => apiClient.delete(`/admin/reviews/${id}`),
  questions: () => apiClient.get("/admin/questions"),
  answerQuestion: (id, answer) =>
    apiClient.post(`/admin/questions/${id}/answer`, { answer }),
};
