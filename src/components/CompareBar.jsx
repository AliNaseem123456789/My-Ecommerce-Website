import { useContext } from "react";
import { Link } from "react-router-dom";
import { CompareContext } from "./context/compare-context";
import { productImageFrom } from "../utils/productImage";

export default function CompareBar() {
  const { items, toggleCompare, clearCompare, notice } = useContext(CompareContext);
  if (!items.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 40,
        background: "#111",
        color: "#fff",
        borderRadius: 8,
        padding: 12,
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {items.map((item) => (
        <button
          key={item.product_id}
          type="button"
          onClick={() => toggleCompare(item)}
          style={{ background: "transparent", color: "#fff", border: 0, cursor: "pointer" }}
        >
          <img
            src={productImageFrom(item)}
            alt={item.name}
            width="48"
            height="48"
            loading="lazy"
            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
          />
        </button>
      ))}
      <span>{items.length} / 4 selected</span>
      {notice ? <span>{notice}</span> : null}
      <Link to="/compare" style={{ color: "#fff", marginLeft: "auto" }}>
        Compare
      </Link>
      <button type="button" onClick={clearCompare} style={{ color: "#fff", background: "transparent", border: 0 }}>
        Clear
      </button>
    </div>
  );
}
