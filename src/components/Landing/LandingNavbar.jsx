import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthModal from "../AuthModal";

import styles from "../../styles/LandingPage.module.css";

export default function LandingNavbar() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLoginClick = () => {
    setShowAuthModal(true);
  };

  const handleAuthClose = (loggedIn = false) => {
    setShowAuthModal(false);
    if (loggedIn === true) {
      navigate("/Home");
    }
  };

  return (
    <div>
      {/* TOP BAR */}
      <div className={styles.navTop}>
        <div className={styles.navAuth} onClick={handleLoginClick}>
          Login / Sign Up
        </div>

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
