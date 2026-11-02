import apiClient from "../api/apiClient";

export const adminService = {
  summary: () => apiClient.get("/admin/summary"),

  // Products
  products: () => apiClient.get("/admin/products"),
  product: (id) => apiClient.get(`/admin/products/${id}`),
  createProduct: (body) => apiClient.post("/admin/products", body),
  updateProduct: (id, body) => apiClient.patch(`/admin/products/${id}`, body),
  deleteProduct: (id) => apiClient.delete(`/admin/products/${id}`),
  uploadImage: (id, dataUrl) =>
    apiClient.post(`/admin/products/${id}/image`, { dataUrl }),

  // Gallery (multipart). Content-Type is cleared so the browser sets the
  // multipart boundary itself.
  productImages: (id) => apiClient.get(`/admin/products/${id}/images`),
  uploadProductImages: (id, files) => {
    const body = new FormData();
    Array.from(files).forEach((file) => body.append("files", file));
    return apiClient.post(`/admin/products/${id}/images`, body, {
      headers: { "Content-Type": undefined },
    });
  },
  deleteProductImage: (id, imageId) =>
    apiClient.delete(`/admin/products/${id}/images/${imageId}`),
  reorderProductImages: (id, ids) =>
    apiClient.patch(`/admin/products/${id}/images/reorder`, { ids }),
  setPrimaryProductImage: (id, imageId) =>
    apiClient.patch(`/admin/products/${id}/images/${imageId}/primary`),

  // Categories
  categories: () => apiClient.get("/admin/categories"),
  createCategory: (body) => apiClient.post("/admin/categories", body),
  updateCategory: (id, body) => apiClient.patch(`/admin/categories/${id}`, body),
  uploadCategoryImage: (id, file) => {
    const body = new FormData();
    body.append("file", file);
    return apiClient.post(`/admin/categories/${id}/image`, body, {
      headers: { "Content-Type": undefined },
    });
  },

  // Brands
  brands: () => apiClient.get("/admin/brands"),
  createBrand: (body) => apiClient.post("/admin/brands", body),
  updateBrand: (id, body) => apiClient.patch(`/admin/brands/${id}`, body),
  deleteBrand: (id) => apiClient.delete(`/admin/brands/${id}`),
  uploadBrandLogo: (id, file) => {
    const body = new FormData();
    body.append("file", file);
    return apiClient.post(`/admin/brands/${id}/logo`, body, {
      headers: { "Content-Type": undefined },
    });
  },

  // Collections
  collections: () => apiClient.get("/admin/collections"),
  collectionProducts: (id) => apiClient.get(`/admin/collections/${id}/products`),
  createCollection: (body) => apiClient.post("/admin/collections", body),
  updateCollection: (id, body) =>
    apiClient.patch(`/admin/collections/${id}`, body),
  deleteCollection: (id) => apiClient.delete(`/admin/collections/${id}`),
  setCollectionProducts: (id, productIds) =>
    apiClient.put(`/admin/collections/${id}/products`, {
      product_ids: productIds,
    }),
  uploadCollectionImage: (id, file) => {
    const body = new FormData();
    body.append("file", file);
    return apiClient.post(`/admin/collections/${id}/image`, body, {
      headers: { "Content-Type": undefined },
    });
  },

  // Promotions
  promotions: () => apiClient.get("/admin/promotions"),
  createPromotion: (body) => apiClient.post("/admin/promotions", body),
  updatePromotion: (id, body) => apiClient.patch(`/admin/promotions/${id}`, body),
  deletePromotion: (id) => apiClient.delete(`/admin/promotions/${id}`),
  uploadPromotionImage: (id, file) => {
    const body = new FormData();
    body.append("file", file);
    return apiClient.post(`/admin/promotions/${id}/image`, body, {
      headers: { "Content-Type": undefined },
    });
  },

  // Landing page sections
  landingMeta: () => apiClient.get("/admin/landing/meta"),
  landingSections: () => apiClient.get("/admin/landing/sections"),
  createSection: (body) => apiClient.post("/admin/landing/sections", body),
  updateSection: (id, body) =>
    apiClient.patch(`/admin/landing/sections/${id}`, body),
  deleteSection: (id) => apiClient.delete(`/admin/landing/sections/${id}`),
  reorderSections: (ids) =>
    apiClient.patch("/admin/landing/sections/reorder", { ids }),

  // Orders
  orders: (status) =>
    apiClient.get("/admin/orders", { params: status ? { status } : {} }),
  order: (id) => apiClient.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status, tracking = {}) =>
    apiClient.patch(`/admin/orders/${id}/status`, { status, ...tracking }),
  updateTracking: (id, body) =>
    apiClient.patch(`/admin/orders/${id}/tracking`, body),

  // People and content
  customers: () => apiClient.get("/admin/customers"),
  reviews: () => apiClient.get("/admin/reviews"),
  deleteReview: (id) => apiClient.delete(`/admin/reviews/${id}`),
  questions: () => apiClient.get("/admin/questions"),
  answerQuestion: (id, answer) =>
    apiClient.post(`/admin/questions/${id}/answer`, { answer }),

  // Coupons
  coupons: () => apiClient.get("/admin/coupons"),
  createCoupon: (body) => apiClient.post("/admin/coupons", body),
  updateCoupon: (id, body) => apiClient.patch(`/admin/coupons/${id}`, body),
  deleteCoupon: (id) => apiClient.delete(`/admin/coupons/${id}`),
};
