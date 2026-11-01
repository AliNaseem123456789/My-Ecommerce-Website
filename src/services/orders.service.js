import apiClient from "../api/apiClient";
export const orderService = {
  getUserOrders: async (userId) => {
    return await apiClient.get(`/orders/my-orders?userId=${userId}`);
  },
};
