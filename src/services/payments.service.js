import apiClient from "../api/apiClient";
export const paymentsService = {
  async createPaymentIntent(amount) {
    try {
      const response = await apiClient.post("/payments/create-payment-intent", {
        amount,
      });
      return response;
    } catch (error) {
      console.error("Payment intent error:", error);
      throw error;
    }
  },

  async retrievePaymentIntent(paymentIntentId) {
    try {
      const response = await apiClient.get(
        `/payments/payment-intent/${paymentIntentId}`,
      );
      return response;
    } catch (error) {
      console.error("Retrieve payment intent error:", error);
      throw error;
    }
  },
};
