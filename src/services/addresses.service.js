import apiClient from "../api/apiClient";

export const addressService = {
  fetchAddresses: async (userId) => {
    return await apiClient.get(`/account/addresses/${userId}`);
  },
  saveAddress: async (userId, type, formData) => {
    const { id, created_at, user_id, ...cleanData } = formData;
    return await apiClient.post(`/account/addresses/${userId}`, {
      type,
      formData: cleanData,
    });
  },
};
