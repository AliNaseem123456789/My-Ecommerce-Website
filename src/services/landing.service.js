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

  // Derived rows: no curation needed, they fill themselves from store data.
  async getBestSellers(limit = 8) {
    return apiClient.get("/products/best-sellers", { params: { limit } });
  },

  async getNewArrivals(limit = 8) {
    return apiClient.get("/products/new-arrivals", { params: { limit } });
  },

  async getTopRated(limit = 8) {
    return apiClient.get("/products/top-rated", { params: { limit } });
  },

  async getMostWishlisted(limit = 8) {
    return apiClient.get("/products/most-wishlisted", { params: { limit } });
  },

  /** A few products inside a price band, used to illustrate the price tiles. */
  async getByPriceBand({ minPrice, maxPrice, limit = 3 }) {
    const params = { page: 1, limit };
    if (minPrice != null) params.minPrice = minPrice;
    if (maxPrice != null) params.maxPrice = maxPrice;
    return apiClient.get("/products", { params });
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
