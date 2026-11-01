import React, { useContext, useEffect, useState } from "react";
import { WishlistContext } from "../components/context/WishlistContext";
import { CartContext } from "../components/context/CartContext";
import { AuthContext } from "../components/context/AuthContext";
import apiClient from "../api/apiClient";
import { X } from "lucide-react";
import styles from "../styles/wishlist.module.css";
import { productImageFrom } from "../utils/productImage";

export default function Wishlist() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (authLoading) return;
      if (wishlist.length === 0) {
        setProducts([]);
        return;
      }
      setLoadingProducts(true);
      try {
        const data = user?.id
          ? await apiClient.get(`/wishlist/${user.id}/details`)
          : await apiClient.get(`/products/by-ids?ids=${wishlist.join(",")}`);
        setProducts(Array.isArray(data) ? data : data?.items || []);
      } catch (error) {
        console.error("Fetch Details Error:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchDetails();
  }, [user?.id, wishlist, authLoading]);

  if (authLoading) return <div className={styles.page}>Loading session...</div>;

  const moveToCart = async (product) => {
    await addToCart(product);
    if (wishlist.includes(product.product_id)) {
      await toggleWishlist(product.product_id);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>My Wishlist</h2>
        {products.length > 0 && (
          <button type="button" onClick={() => products.forEach((product) => moveToCart(product))}>
            Move all to cart
          </button>
        )}

        {/* Row Headers */}
        <div className={styles.headerRow}>
          <div style={{ flex: 3 }}>Product</div>
          <div style={{ flex: 1, textAlign: "center" }}>Price</div>
          <div style={{ flex: 1, textAlign: "center" }}>Action</div>
        </div>

        {loadingProducts ? (
          <p className={styles.empty}>Fetching items...</p>
        ) : products.length === 0 ? (
          <p className={styles.empty}>Your wishlist is empty.</p>
        ) : (
          products.map((product) => (
            <div key={product.product_id} className={styles.row}>
              <div className={styles.productCol}>
                <button
                  onClick={() => toggleWishlist(product.product_id)}
                  className={styles.removeBtn}
                >
                  <X size={18} />
                </button>
                <img
                  src={productImageFrom(product)}
                  alt={product.name}
                  width="80"
                  height="80"
                  loading="lazy"
                  className={styles.image}
                />

                <p className={styles.name}>{product.name}</p>
              </div>
              <div className={styles.price}>${product.price}</div>
              <div className={styles.action}>
                <button
                  onClick={() => moveToCart(product)}
                  className={styles.cartBtn}
                >
                  Move to cart
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
