import React, { useContext } from "react";
import { CartContext } from "./context/CartContext";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/CartSidebar.module.css";

export default function CartSidebar({ onClose }) {
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
      return "https://via.placeholder.com/80";
    }
  };

  return (
    <>
      {}
      <div className={styles.overlay} onClick={onClose} />

      {}
      <div className={styles.sidebar}>
        {}
        <div className={styles.header}>
          <h2>Shopping Cart</h2>
          <X size={24} onClick={onClose} className={styles.closeIcon} />
        </div>

        <p className={styles.message}>
          🔥 These products are limited, checkout within{" "}
          <strong>03m 50s</strong>
        </p>
        <div className={styles.items}>
          {cartItems.map((item) => (
            <div key={item.cart_item_id} className={styles.item}>
              <img
                src={getLocalImage(item.products.product_id)}
                alt={item.products.name}
                className={styles.image}
              />

              <div className={styles.itemInfo}>
                <p className={styles.name}>
                  {item.products.name.slice(0, 50)}...
                </p>
                <p className={styles.price}>${item.products.price}</p>

                <div className={styles.controls}>
                  <button
                    onClick={() =>
                      updateQuantity(item.cart_item_id, item.quantity - 1)
                    }
                  >
                    –
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(item.cart_item_id, item.quantity + 1)
                    }
                  >
                    +
                  </button>

                  <button
                    className={styles.remove}
                    onClick={() => removeFromCart(item.cart_item_id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {}
        <div className={styles.footer}>
          <div className={styles.subtotal}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <button
            className={styles.checkoutBtn}
            onClick={() => {
              onClose();
              navigate("/checkout");
            }}
          >
            CHECKOUT
          </button>

          <button
            className={styles.viewCartBtn}
            onClick={() => {
              onClose();
              navigate("/cart");
            }}
          >
            VIEW CART
          </button>
        </div>
      </div>
    </>
  );
}
