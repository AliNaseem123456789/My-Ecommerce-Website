const KEY = "recent_products";

export function rememberProduct(product) {
  if (!product?.product_id) return;
  const current = readRecent();
  const next = [
    {
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      image_url: product.image_url || null,
    },
    ...current.filter((item) => item.product_id !== product.product_id),
  ].slice(0, 8);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function readRecent() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}
