import apiClient from "../api/apiClient";

/** Storefront reads for brands, collections, promotions and landing sections. */
export const ContentService = {
  getBrands: (featured = false) =>
    apiClient.get("/brands", { params: featured ? { featured: true } : {} }),
  getBrand: (slug) => apiClient.get(`/brands/${slug}`),

  getCollections: () => apiClient.get("/collections"),
  getCollection: (slug) => apiClient.get(`/collections/${slug}`),

  getPromotions: () => apiClient.get("/promotions"),

  getLandingSections: () => apiClient.get("/landing/sections"),

  getCategoryTree: () => apiClient.get("/categories/tree"),
};
