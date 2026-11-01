import apiClient from "../api/apiClient";

export const couponService = {
  validate: (code, userId) =>
    apiClient.post("/coupons/validate", { code, userId }),
};

export const shippingService = {
  list: () => apiClient.get("/shipping-options"),
};
