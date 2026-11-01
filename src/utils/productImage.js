const PLACEHOLDER = "https://via.placeholder.com/300";

export function productImageFrom(product) {
  if (!product) return PLACEHOLDER;
  if (typeof product === "string") return product || PLACEHOLDER;
  return product.image_url || PLACEHOLDER;
}
