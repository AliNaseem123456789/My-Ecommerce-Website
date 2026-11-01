const PLACEHOLDER = "https://via.placeholder.com/300";

export function productImageUrl(filename) {
  try {
    return new URL(`../assets/products/${filename}`, import.meta.url).href;
  } catch {
    return null;
  }
}

export function productImages(productId) {
  const files = [
    `${productId}.jpeg`,
    `${productId}-1.jpeg`,
    `${productId}.jpg`,
    `${productId}-1.jpg`,
  ];
  const urls = [];
  files.forEach((file) => {
    const url = productImageUrl(file);
    if (url && !urls.includes(url)) urls.push(url);
  });
  return urls.length ? urls : [PLACEHOLDER];
}

export function productPrimaryImage(productId) {
  return productImages(productId)[0];
}
