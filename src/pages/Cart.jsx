import React, { useContext } from "react";
import { CartContext } from "../components/context/CartContext";
import { Pencil, Truck, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";

import styles from "../styles/cart.module.css";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0,
  );

  const getLocalImage = (id) => {
    try {
      return new URL(`/src/assets/products/${id}.jpeg`, import.meta.url).href;
    } catch {
      return "https://via.placeholder.com/100";
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>Shopping Cart</h2>
        <div className={styles.headerRow}>
          <div className={styles.colProduct}>Product</div>
          <div className={styles.colCenter}>Price</div>
          <div className={styles.colCenter}>Quantity</div>
          <div className={styles.colCenter}>Subtotal</div>
        </div>
        {cartItems.map((item) => (
          <div key={item.cart_item_id} className={styles.cartRow}>
            <div className={styles.productInfo}>
              <img
                src={getLocalImage(item.products.product_id)}
                alt={item.products.name}
                className={styles.productImage}
              />
              <div>
                <p className={styles.productName}>{item.products.name}</p>
                <button
                  onClick={() => removeFromCart(item.cart_item_id)}
                  className={styles.removeBtn}
                >
                  Remove
                </button>
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div>${item.products.price.toFixed(2)}</div>

              <div className={styles.qtyControls}>
                <button
                  onClick={() =>
                    updateQuantity(item.cart_item_id, item.quantity - 1)
                  }
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.cart_item_id, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>

              <div className={styles.subtotal}>
                ${(item.products.price * item.quantity).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
        <div className={styles.checkoutWrapper}>
          <div className={styles.checkoutBox}>
            <div className={styles.iconRow}>
              <div>
                <Pencil size={18} />
                <p>Note</p>
              </div>
              <span />
              <div>
                <Truck size={18} />
                <p>Shipping</p>
              </div>
              <span />
              <div>
                <Ticket size={18} />
                <p>Coupon</p>
              </div>
            </div>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span className={styles.priceBlue}>${subtotal.toFixed(2)}</span>
            </div>

            <div className={styles.totalRow}>
              <strong>Total</strong>
              <strong className={styles.priceBlue}>
                ${subtotal.toFixed(2)}
              </strong>
            </div>

            <button
              className={styles.checkoutBtn}
              onClick={() => navigate("/checkout")}
            >
              CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
