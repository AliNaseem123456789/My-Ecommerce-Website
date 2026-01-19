import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { AuthContext } from "./AuthContext";

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if Auth is done loading and we have a user
    if (!authLoading && user?.id) {
      const fetchWishlist = async () => {
        try {
          const data = await apiClient.get(`/wishlist/${user.id}`);
          // data is the array of IDs directly
          setWishlist(Array.isArray(data) ? data : []);
        } catch (e) {
          console.error("Wishlist Context Error", e);
        } finally {
          setLoading(false);
        }
      };

      fetchWishlist();
    } else if (!authLoading) {
      setWishlist([]);
      setLoading(false);
    }
  }, [user, authLoading]);

  const toggleWishlist = async (productId) => {
    if (!user) return; // Add your Swal alert here
    try {
      const res = await apiClient.post("/wishlist/toggle", {
        userId: user.id,
        productId,
      });
      const action = res.data?.action || res.action;

      if (action === "added") {
        setWishlist((prev) => [...prev, productId]);
      } else {
        setWishlist((prev) => prev.filter((id) => id !== productId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}
