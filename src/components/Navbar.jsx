import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaStar,
  FaShoppingCart,
  FaSearch,
  FaBars,
  FaHome,
  FaStore,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
} from "react-icons/fa";
import { CartContext } from "./context/CartContext";
import { WishlistContext } from "./context/WishlistContext";
import { AuthContext } from "./context/AuthContext";
import CartSidebar from "../components/CartSidebar";
import AuthModal from "../components/AuthModal";
import styles from "../styles/Navbar.module.css";
import { CategoriesService } from "../services/categories.service";
function Navbar() {
  const navigate = useNavigate();
  const { totalItems } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const { user, logout } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await CategoriesService.getAllCategories();
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate("/");
  };

  const handleCartClick = () => {
    if (window.location.pathname === "/cart") window.scrollTo(0, 0);
    else setCartOpen(true);
  };

  return (
    <div className={styles.navbar}>
      {!isMobile && (
        <>
          <div className={styles.desktopTop}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search products..."
                className={styles.searchInput}
              />
              <FaSearch className={styles.searchIcon} />
            </div>
            <div className={styles.iconGroup}>
              <FaUser
                className={styles.icon}
                onClick={() =>
                  user ? navigate("/account") : setShowAuthModal(true)
                }
              />
              <div className={styles.iconWrapper}>
                <FaStar onClick={() => navigate("/wishlist")} />
                {wishlist.length > 0 && (
                  <span className={styles.badge}>{wishlist.length}</span>
                )}
              </div>
              <div className={styles.iconWrapper}>
                <FaShoppingCart onClick={handleCartClick} />
                {totalItems > 0 && (
                  <span className={styles.badge}>{totalItems}</span>
                )}
              </div>
              {user && (
                <FaSignOutAlt
                  className={styles.logoutIcon}
                  onClick={handleLogout}
                />
              )}
            </div>
          </div>
          <div className={styles.subNav}>
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/about-us">About Us</Link>
          </div>
        </>
      )}

      {isMobile && (
        <div className={styles.mobileTop}>
          <FaBars onClick={() => setSidebarOpen(true)} />
          {/* <img src={logo} alt="Logo" className={styles.mobileLogo} /> */}
          <div className={styles.mobileIcons}>
            <FaSearch onClick={() => navigate("/search")} />
            <div className={styles.iconWrapper}>
              <FaShoppingCart onClick={handleCartClick} />
              {totalItems > 0 && (
                <span className={styles.badge}>{totalItems}</span>
              )}
            </div>
          </div>
        </div>
      )}
      {isMobile && sidebarOpen && (
        <div className={styles.sidebar}>
          <FaTimes
            className={styles.closeIcon}
            onClick={() => setSidebarOpen(false)}
          />

          <nav className={styles.sidebarNav}>
            <Link to="/" onClick={() => setSidebarOpen(false)}>
              Home
            </Link>
            <Link to="/shop" onClick={() => setSidebarOpen(false)}>
              Shop
            </Link>

            <div className={styles.category}>
              <span onClick={() => setDropdownOpen(!dropdownOpen)}>
                Categories {dropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
              </span>

              {dropdownOpen && (
                <div className={styles.categoryList}>
                  {categories.map((cat) => (
                    <span
                      key={cat.category_id}
                      onClick={() =>
                        navigate(`/shop?category=${cat.category_id}`)
                      }
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Link to="/about-us">About Us</Link>

            {!user ? (
              <button
                className={styles.loginBtn}
                onClick={() => setShowAuthModal(true)}
              >
                Login / Sign Up
              </button>
            ) : (
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
      {isMobile && (
        <div className={styles.bottomNav}>
          <div onClick={() => navigate("/")}>
            <FaHome />
            <span>Home</span>
          </div>
          <div onClick={() => navigate("/shop")}>
            <FaStore />
            <span>Shop</span>
          </div>
          <div onClick={() => navigate("/wishlist")}>
            <FaStar />
            <span>Wishlist</span>
          </div>
          <div onClick={() => navigate("/account")}>
            <FaUser />
            <span>Account</span>
          </div>
        </div>
      )}

      {cartOpen && <CartSidebar onClose={() => setCartOpen(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

export default Navbar;
