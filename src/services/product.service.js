import apiClient from "../api/apiClient";
export const productService = {
  getProducts: (params) => apiClient.get("/products", { params }),
  getProductById: async (id) => {
    return await apiClient.get(`/products/${id}`);
  },
  getFeatured: (ids) => apiClient.get(`/products/featured?ids=${ids}`),
};
