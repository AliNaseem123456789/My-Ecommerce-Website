import apiClient from "../api/apiClient";

export const searchService = {
  async searchProducts(query, filters = {}) {
    try {
      const response = await apiClient.get("/products/search", {
        params: {
          q: query,
          category: filters.category,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          sortBy: filters.sortBy,
        },
      });
      return response;
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  },

  async getSearchSuggestions(query) {
    try {
      const response = await apiClient.get("/products/suggestions", {
        params: { q: query },
      });
      return response;
    } catch (error) {
      console.error("Suggestions error:", error);
      return [];
    }
  },
};
