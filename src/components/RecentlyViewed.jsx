import { Link } from "react-router-dom";
import { productImageFrom } from "../utils/productImage";
import { readRecent } from "../utils/recentProducts";

export default function RecentlyViewed({ excludeId }) {
  const items = readRecent().filter((item) => item.product_id !== excludeId);
  if (!items.length) return null;
  return (
    <section style={{ marginTop: 32 }}>
      <h2>Recently viewed</h2>
      <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
        {items.map((item) => (
          <Link key={item.product_id} to={`/product/${item.product_id}`} style={{ width: 140 }}>
            <img
              src={productImageFrom(item)}
              alt={item.name}
              width="140"
              height="140"
              loading="lazy"
              style={{ width: 140, height: 140, objectFit: "cover" }}
            />
            <div>{item.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
