import apiClient from "../api/apiClient";

export const reviewService = {
  submitReview: async (productId, formData) => {
    return await apiClient.post("/reviews", {
      product_id: productId,
      formData: formData,
    });
  },

  getReviews: async (productId) => {
    return await apiClient.get(`/reviews/${productId}`);
  },
};
