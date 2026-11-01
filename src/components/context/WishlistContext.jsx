import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { AuthContext } from "./AuthContext";

export const WishlistContext = createContext();

const GUEST_KEY = "guest_wishlist";

function readGuest() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setWishlist(readGuest());
      setLoading(false);
      return;
    }
    const fetchWishlist = async () => {
      try {
        const data = await apiClient.get(`/wishlist/${user.id}`);
        setWishlist(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Wishlist Context Error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user, authLoading]);

  const toggleWishlist = async (productId) => {
    const id = Number(productId);
    if (!user) {
      setWishlist((prev) => {
        const next = prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id];
        localStorage.setItem(GUEST_KEY, JSON.stringify(next));
        return next;
      });
      return;
    }
    try {
      const res = await apiClient.post("/wishlist/toggle", {
        userId: user.id,
        productId: id,
      });
      const action = res.data?.action || res.action;
      if (action === "added") {
        setWishlist((prev) => [...prev, id]);
      } else {
        setWishlist((prev) => prev.filter((item) => item !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const mergeWishlist = async (userId) => {
    const ids = readGuest();
    if (!ids.length) return;
    await apiClient.post("/wishlist/merge", { userId, productIds: ids });
    localStorage.removeItem(GUEST_KEY);
    const data = await apiClient.get(`/wishlist/${userId}`);
    setWishlist(Array.isArray(data) ? data : []);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggleWishlist, mergeWishlist, loading }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
