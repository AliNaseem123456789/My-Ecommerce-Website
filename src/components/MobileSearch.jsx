import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/components.module.css";

function MobileSearch() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const popularSearches = ["Headphone", "Mobile", "Glasses"];

  return (
    <div className={styles.mobileSearchOverlay}>
      <div className={styles.mobileSearchCloseRow}>
        <button
          onClick={() => navigate(-1)}
          className={styles.mobileSearchCloseBtn}
          aria-label="Close Search"
        >
          ×
        </button>
      </div>
      <h2 className={styles.mobileSearchTitle}>SEARCH OUR STORE</h2>
      <form
        className={styles.mobileSearchInputWrapper}
        onSubmit={(event) => {
          event.preventDefault();
          const query = searchQuery.trim();
          if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
        }}
      >
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.mobileSearchInput}
        />
      </form>
      <div>
        <h3 className={styles.mobileSearchSubtitle}>Popular Searches</h3>
        <div className={styles.mobileSearchList}>
          {popularSearches.map((item, index) => (
            <span
              key={index}
              className={styles.mobileSearchItem}
              onClick={() => navigate(`/search?q=${encodeURIComponent(item)}`)}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
export default MobileSearch;
