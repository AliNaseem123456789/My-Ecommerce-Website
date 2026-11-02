const PLACEHOLDER = "https://via.placeholder.com/300";

/**
 * Ordered gallery for a product, primary first.
 * Falls back to the single image_url, then to a placeholder.
 */
export function productImagesFrom(product) {
  if (!product) return [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images.filter(Boolean);
  }
  if (product.image_url) return [product.image_url];
  return [];
}

/** The single image to show on a card, in the cart, wishlist or compare. */
export function productImageFrom(product) {
  if (!product) return PLACEHOLDER;
  if (typeof product === "string") return product || PLACEHOLDER;
  return productImagesFrom(product)[0] || PLACEHOLDER;
}

/** Second image, used for the hover swap on product cards. */
export function productHoverImageFrom(product) {
  return productImagesFrom(product)[1] || null;
}

export { PLACEHOLDER };
