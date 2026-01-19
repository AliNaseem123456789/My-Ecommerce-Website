import apiClient from "../api/apiClient";
export const questionService = {
  askQuestion: async (productId, formData) => {
    return await apiClient.post("/questions", {
      product_id: productId,
      formData: formData,
    });
  },

  getQuestions: async (productId) => {
    return await apiClient.get(`/questions/${productId}`);
  },
};
