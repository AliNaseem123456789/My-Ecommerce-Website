import { useEffect, useState } from "react";
import { CompareContext } from "./compare-context";

const KEY = "compare_products";

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 4) : [];
  } catch {
    return [];
  }
}

function snapshot(product) {
  return {
    product_id: product.product_id,
    name: product.name,
    price: product.price,
    avg_rating: product.avg_rating ?? 0,
    stock: product.stock ?? 0,
    category: product.categoryName || product.categories?.name || "Uncategorized",
    description: product.description || "",
    image_url: product.image_url || null,
  };
}

export function CompareProvider({ children }) {
  const [items, setItems] = useState(read);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const toggleCompare = (product) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.product_id === product.product_id);
      if (exists) {
        setNotice("");
        return prev.filter((item) => item.product_id !== product.product_id);
      }
      if (prev.length >= 4) {
        setNotice("You can compare up to 4 products.");
        return prev;
      }
      setNotice("");
      return [...prev, snapshot(product)];
    });
  };

  const clearCompare = () => setItems([]);

  return (
    <CompareContext.Provider value={{ items, toggleCompare, clearCompare, notice }}>
      {children}
    </CompareContext.Provider>
  );
}
