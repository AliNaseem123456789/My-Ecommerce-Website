import apiClient from "../api/apiClient";
export const paymentsService = {
  async createPaymentIntent(payload) {
    try {
      const response = await apiClient.post(
        "/payments/create-payment-intent",
        payload,
      );
      return response;
    } catch (error) {
      console.error("Payment intent error:", error);
      throw error;
    }
  },
};
