import apiClient from "../api/apiClient";

export const CategoriesService = {
  getAllCategories() {
    return apiClient.get("/categories");
  },

  /** Categories flagged for the landing page, already in display order. */
  getFeatured() {
    return apiClient.get("/categories/featured");
  },
};
