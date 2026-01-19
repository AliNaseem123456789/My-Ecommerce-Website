import React, { useContext, useEffect, useState } from "react";
import { WishlistContext } from "../components/context/WishlistContext";
import { CartContext } from "../components/context/CartContext";
import { AuthContext } from "../components/context/AuthContext";
import apiClient from "../api/apiClient";
import { X } from "lucide-react";
import styles from "../styles/wishlist.module.css";

export default function Wishlist() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const getLocalImage = (id) => {
    try {
      return new URL(`/src/assets/products/${id}.jpeg`, import.meta.url).href;
    } catch {
      return "https://via.placeholder.com/100";
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (authLoading || !user?.id) return;
      if (wishlist.length === 0) {
        setProducts([]);
        return;
      }
      if (authLoading) {
        console.log("Stuck at: Auth is still loading");
        return;
      }
      if (!user) {
        console.log("Stuck at: No user object found in Context");
        return;
      }
      if (!user.id) {
        console.log("Stuck at: User object exists but .id is missing", user);
        return;
      }
      setLoadingProducts(true);
      try {
        // response is already the array because of your interceptor
        const data = await apiClient.get(`/wishlist/${user.id}/details`);
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch Details Error:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchDetails();
  }, [user?.id, wishlist, authLoading]);

  if (authLoading) return <div className={styles.page}>Loading session...</div>;
  if (!user)
    return <div className={styles.page}>Please log in to view wishlist.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>My Wishlist</h2>

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
                  src={getLocalImage(product.product_id)}
                  alt={product.name}
                  className={styles.image}
                />

                <p className={styles.name}>{product.name}</p>
              </div>
              <div className={styles.price}>${product.price}</div>
              <div className={styles.action}>
                <button
                  onClick={() => addToCart(product)}
                  className={styles.cartBtn}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
