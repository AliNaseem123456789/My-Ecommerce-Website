import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaStar,
  FaShoppingCart,
  FaSearch,
  FaSignOutAlt,
} from "react-icons/fa";
import AuthModal from "../AuthModal";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";

import styles from "../../styles/LandingPage.module.css";

const iconButton = {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  padding: 6,
  cursor: "pointer",
  color: "inherit",
  fontSize: 16,
  lineHeight: 1,
};

const badge = {
  position: "absolute",
  top: -2,
  right: -4,
  minWidth: 16,
  height: 16,
  padding: "0 4px",
  borderRadius: 8,
  background: "#e53935",
  color: "#fff",
  fontSize: 10,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function LandingNavbar() {
  const navigate = useNavigate();
  const { user, loading, logout } = useContext(AuthContext);
  const { totalItems } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthClose = (loggedIn = false) => {
    setShowAuthModal(false);
    if (loggedIn === true) {
      navigate("/Home");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const wishlistCount = wishlist?.length || 0;

  return (
    <div>
      {/* TOP BAR */}
      <div className={styles.navTop}>
        {/* Nothing is shown until auth has resolved, so the bar never flashes
            "Login / Sign Up" at someone who is already signed in. */}
        {loading ? (
          <div style={{ height: 28 }} />
        ) : user ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginLeft: "auto",
            }}
          >
            <span style={{ fontSize: 13, whiteSpace: "nowrap" }}>
              Hi, {user.name || user.email}
            </span>

            <button
              type="button"
              style={iconButton}
              aria-label="Search"
              title="Search"
              onClick={() => navigate("/search")}
            >
              <FaSearch />
            </button>

            <button
              type="button"
              style={iconButton}
              aria-label="Wishlist"
              title="Wishlist"
              onClick={() => navigate("/wishlist")}
            >
              <FaStar />
              {wishlistCount > 0 && <span style={badge}>{wishlistCount}</span>}
            </button>

            <button
              type="button"
              style={iconButton}
              aria-label="Cart"
              title="Cart"
              onClick={() => navigate("/cart")}
            >
              <FaShoppingCart />
              {totalItems > 0 && <span style={badge}>{totalItems}</span>}
            </button>

            <button
              type="button"
              style={iconButton}
              aria-label="Account"
              title="Account"
              onClick={() => navigate("/account")}
            >
              <FaUser />
            </button>

            {user.role === "admin" && (
              <button
                type="button"
                style={{ ...iconButton, fontSize: 13, fontWeight: 600 }}
                onClick={() => navigate("/admin")}
              >
                Admin
              </button>
            )}

            <button
              type="button"
              style={iconButton}
              aria-label="Sign out"
              title="Sign out"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
            </button>
          </div>
        ) : (
          <div
            className={styles.navAuth}
            role="button"
            tabIndex={0}
            onClick={() => setShowAuthModal(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setShowAuthModal(true);
              }
            }}
          >
            Login / Sign Up
          </div>
        )}

        {showAuthModal && <AuthModal onClose={handleAuthClose} />}
      </div>

      {/* NAV LINKS BAR */}
      <div className={styles.navBottom}>
        <div className={styles.navLinks}>
          <Link to="/Home" className={styles.navLink}>
            Home
          </Link>
          <Link to="/shop" className={styles.navLink}>
            Shop
          </Link>
          <Link to="/about-us" className={styles.navLink}>
            About Us
          </Link>
        </div>
      </div>
    </div>
  );
}
