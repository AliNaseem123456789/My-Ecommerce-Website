import apiClient from "../api/apiClient";

export const CategoriesService = {
  getAllCategories() {
    return apiClient.get("/categories");
  },
};
