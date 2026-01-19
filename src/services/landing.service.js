import apiClient from "../api/apiClient";

export const LandingService = {
  async getFeaturedProducts(ids) {
    return apiClient.get("/products/featured", {
      params: { ids: ids.join(",") },
    });
  },

  async getCategories() {
    return apiClient.get("/categories");
  },

  async getAllProducts() {
    return apiClient.get("/products");
  },
};
