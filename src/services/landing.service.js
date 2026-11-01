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
    const limit = 60;
    const first = await apiClient.get("/products", { params: { page: 1, limit } });
    const items = [...(first.items || [])];
    const pages = Math.ceil((first.total || 0) / (first.limit || limit));
    for (let page = 2; page <= pages; page += 1) {
      const next = await apiClient.get("/products", { params: { page, limit } });
      items.push(...(next.items || []));
    }
    return items;
  },
};
