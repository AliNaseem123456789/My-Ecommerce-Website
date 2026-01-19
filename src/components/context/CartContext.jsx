import React, { createContext, useState, useEffect, useContext } from "react";
import apiClient from "../../api/apiClient";
import { AuthContext } from "./AuthContext";
import { v4 as uuidv4 } from "uuid";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    if (user) {
      setUserId(user.id);
    } else {
      let guestId = localStorage.getItem("guest_user_id");
      if (!guestId) {
        guestId = uuidv4();
        localStorage.setItem("guest_user_id", guestId);
      }
      setUserId(guestId);
    }
  }, [user]);

  const fetchCart = async () => {
    if (!userId) return;
    try {
      const data = await apiClient.get(`/cart/${userId}`);
      setCartItems(data);
    } catch (err) {
      console.error("Cart fetch error", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const addToCart = async (product) => {
    try {
      await apiClient.post("/cart/add", {
        userId,
        productId: product.product_id,
        quantity: 1,
      });
      fetchCart();
    } catch (err) {
      console.error("Add error", err);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await apiClient.put("/cart/update", { cartItemId, quantity });
      setCartItems((prev) =>
        prev.map((item) =>
          item.cart_item_id === cartItemId ? { ...item, quantity } : item,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await apiClient.delete(`/cart/${cartItemId}`);
      setCartItems((prev) =>
        prev.filter((item) => item.cart_item_id !== cartItemId),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const mergeCart = async (guestId, realUserId) => {
    try {
      await apiClient.post("/cart/merge", { guestId, userId: realUserId });
      localStorage.removeItem("guest_user_id");
      fetchCart(); // Refresh cart with merged items
    } catch (err) {
      console.error("Merge error", err);
    }
  };
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        userId,
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        mergeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
