/**
 * Build public/sitemap.xml from the live catalog.
 * Run automatically by npm run build.
 */
import { writeFile } from "node:fs/promises";

const api =
  process.env.SITEMAP_API_URL ||
  "https://ecommerce-website-backend-k4vc.onrender.com/api/v1";
const site =
  process.env.SITEMAP_SITE_URL ||
  "https://my-ecommerce-website-three.vercel.app";

const staticPaths = [
  "/",
  "/shop",
  "/about-us",
  "/contact-us",
  "/faq",
  "/privacy-policy",
  "/terms-and-conditions",
  "/refund-returns",
  "/track-order",
];

async function getJson(path) {
  const response = await fetch(`${api}${path}`);
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json();
}

const urls = new Set(staticPaths.map((path) => `${site}${path}`));
const products = [];
let page = 1;
let total = Infinity;
while (products.length < total) {
  const data = await getJson(`/products?page=${page}&limit=60`);
  const rows = Array.isArray(data) ? data : data.items || [];
  total = Array.isArray(data) ? rows.length : data.total ?? rows.length;
  products.push(...rows);
  if (!rows.length || Array.isArray(data)) break;
  page += 1;
}
for (const product of products) {
  urls.add(`${site}/product/${product.product_id}`);
}
const categories = await getJson("/categories");
for (const category of categories || []) {
  urls.add(`${site}/shop?category=${category.category_id}`);
}

const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls].map((loc) => `  <url><loc>${loc}</loc></url>`).join("\n")}
</urlset>
`;
await writeFile(new URL("../public/sitemap.xml", import.meta.url), body);
console.log(`sitemap.xml wrote ${urls.size} urls`);
