import React, { useContext, useEffect, useState } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { AccountService } from "../../services/account.service";
import { X } from "lucide-react";
import "../../styles/WishlistTab.css";

export default function WishlistTab() {
  const { wishlist, removeWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!wishlist || wishlist.length === 0) {
        setProducts([]);
        return;
      }

      setLoading(true);
      try {
        const data = await AccountService.getWishlistProducts(wishlist);
        const formattedProducts = (data || []).map((p) => ({
          ...p,
          staticImages: [`/assets/products/${p.product_id}/main.jpeg`],
          image: `/assets/products/${p.product_id}/main.jpeg`,
        }));

        setProducts(formattedProducts);
      } catch (err) {
        console.error("Error fetching wishlist products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [wishlist]);

  const getLocalImage = (id) => {
    try {
      return new URL(`/src/assets/products/${id}.jpeg`, import.meta.url).href;
    } catch (err) {
      console.error("Image load error:", err);
      return "https://via.placeholder.com/100";
    }
  };

  if (loading && products.length === 0) {
    return <div className="loading-msg">Loading wishlist...</div>;
  }

  return (
    <div className="wishlist-container">
      <h2 className="wishlist-title">Wishlist</h2>

      {/* HEADER ROW */}
      <div className="wishlist-header">
        <div className="col-product">Product</div>
        <div className="col-price">Price</div>
        <div className="col-action">Action</div>
      </div>

      {/* PRODUCT LIST */}
      {products.length === 0 ? (
        <p className="empty-msg">Your wishlist is empty.</p>
      ) : (
        products.map((product) => {
          const imageUrl = getLocalImage(product.product_id);
          return (
            <div key={product.product_id} className="wishlist-row">
              {/* PRODUCT INFO AREA */}
              <div className="product-info">
                <button
                  onClick={() => removeWishlist(product.product_id)}
                  className="remove-btn"
                  title="Remove from wishlist"
                >
                  <X size={20} />
                </button>

                <img
                  src={imageUrl}
                  alt={product.name}
                  className="product-img"
                />

                <div>
                  <p className="product-name">{product.name}</p>
                </div>
              </div>

              {/* PRICE AREA */}
              <div className="product-price">${product.price}</div>

              {/* ACTION AREA */}
              <div className="action-area">
                <button
                  className="add-cart-btn"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
