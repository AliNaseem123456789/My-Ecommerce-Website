// src/services/account.service.js
import apiClient from "../api/apiClient";

export const AccountService = {
  async getWishlistProducts(ids) {
    if (!ids || ids.length === 0) return [];

    try {
      return await apiClient.get("/products/by-ids", {
        params: { ids: ids.join(",") },
      });
    } catch (error) {
      console.error("Error in getWishlistProducts:", error);
      throw error;
    }
  },
};
