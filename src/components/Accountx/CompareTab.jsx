import { useContext } from "react";
import { Link } from "react-router-dom";
import { CompareContext } from "../context/CompareContext";
import { productImageFrom } from "../../utils/productImage";

const fields = [
  ["Price", (item) => `$${Number(item.price).toFixed(2)}`],
  ["Rating", (item) => Number(item.avg_rating || 0).toFixed(1)],
  ["Stock", (item) => item.stock ?? 0],
  ["Category", (item) => item.category || "Uncategorized"],
  ["Description", (item) => item.description || "—"],
];

export default function CompareTab() {
  const { items, toggleCompare } = useContext(CompareContext);

  if (!items.length) {
    return <p>Select up to 4 products with the compare icon to see them here.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <h2>Compare products</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th />
            {items.map((item) => (
              <th key={item.product_id} style={{ padding: 8, verticalAlign: "top" }}>
                <img
                  src={productImageFrom(item)}
                  alt={item.name}
                  width="120"
                  height="120"
                  loading="lazy"
                  style={{ width: 120, height: 120, objectFit: "cover" }}
                />
                <div>
                  <Link to={`/product/${item.product_id}`}>{item.name}</Link>
                </div>
                <button type="button" onClick={() => toggleCompare(item)}>
                  Remove
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map(([label, read]) => (
            <tr key={label}>
              <th style={{ textAlign: "left", padding: 8 }}>{label}</th>
              {items.map((item) => (
                <td key={item.product_id} style={{ padding: 8 }}>
                  {read(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
