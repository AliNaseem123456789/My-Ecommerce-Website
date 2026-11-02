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

  getProducts({
    categories = [],
    sort = "",
    minPrice = "",
    maxPrice = "",
    brand = "",
    collection = "",
    page = 1,
    limit = 12,
  }) {
    const params = { page, limit };

    if (categories.length > 0) {
      params.categories = categories.join(",");
    }

    if (sort) {
      params.sort = sort;
    }
    if (minPrice !== "") params.minPrice = minPrice;
    if (maxPrice !== "") params.maxPrice = maxPrice;
    if (brand) params.brand = brand;
    if (collection) params.collection = collection;

    return apiClient.get("/products", { params });
  },
};
