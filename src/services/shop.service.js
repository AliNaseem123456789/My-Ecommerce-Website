import apiClient from "../api/apiClient";

export const ShopService = {
  getFeaturedProducts(ids) {
    return apiClient.get("/products/featured", {
      params: { ids: ids.join(",") },
    });
  },
  getCategories() {
    return apiClient.get("/categories");
  },

  getProducts({ categories = [], sort = "" }) {
    const params = {};

    if (categories.length > 0) {
      params.categories = categories.join(",");
    }

    if (sort) {
      params.sort = sort;
    }

    return apiClient.get("/products", { params });
  },
};
