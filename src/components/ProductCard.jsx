import React, { useState, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaBalanceScale, FaRegStar, FaStar } from "react-icons/fa";
import { WishlistContext } from "./context/WishlistContext";

import styles from "../styles/ProductCard.module.css";

export default function ProductCard({ product, addToCart, onQuickView }) {
  const [hover, setHover] = useState(false);
  const [iconHover, setIconHover] = useState(null);

  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const id = product.product_id;

  const createImageUrl = (filename) => {
    try {
      return new URL(`/src/assets/products/${filename}`, import.meta.url).href;
    } catch {
      return null;
    }
  };

  const images = useMemo(() => {
    const imageUrls = [];

    const mainJpeg = createImageUrl(`${id}.jpeg`);
    if (mainJpeg) imageUrls.push(mainJpeg);

    const hoverJpeg = createImageUrl(`${id}-1.jpeg`);
    if (hoverJpeg) imageUrls.push(hoverJpeg);

    const mainJpg = createImageUrl(`${id}.jpg`);
    if (mainJpg && !imageUrls.includes(mainJpg)) imageUrls.push(mainJpg);

    const hoverJpg = createImageUrl(`${id}-1.jpg`);
    if (hoverJpg && !imageUrls.includes(hoverJpg)) imageUrls.push(hoverJpg);

    return imageUrls.length ? imageUrls : ["https://via.placeholder.com/300"];
  }, [id]);

  const displayedImage = hover && images.length > 1 ? images[1] : images[0];

  const isWishlisted = wishlist.includes(id);

  return (
    <div
      className={`${styles.card} ${hover ? styles.hover : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setIconHover(null);
      }}
    >
      {/* Hover Icons */}
      {hover && (
        <div className={styles.iconBar}>
          <Icon
            label="Compare"
            active={iconHover === "compare"}
            onEnter={() => setIconHover("compare")}
            onLeave={() => setIconHover(null)}
          >
            <FaBalanceScale />
          </Icon>

          <Icon
            label="Quick View"
            active={iconHover === "quick"}
            onEnter={() => setIconHover("quick")}
            onLeave={() => setIconHover(null)}
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
          >
            <FaEye />
          </Icon>

          <Icon
            label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            active={iconHover === "wishlist"}
            onEnter={() => setIconHover("wishlist")}
            onLeave={() => setIconHover(null)}
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(id);
            }}
          >
            {isWishlisted ? <FaStar /> : <FaRegStar />}
          </Icon>
        </div>
      )}

      <Link to={`/product/${id}`} className={styles.link}>
        <div className={styles.imageWrapper}>
          <img
            src={displayedImage}
            alt={product.name}
            onError={(e) => (e.target.src = "https://via.placeholder.com/300")}
          />
        </div>

        <div className={styles.content}>
          <p className={styles.category}>
            {product.categoryName || "Uncategorized"}
          </p>

          <h3 className={styles.title}>{product.name}</h3>

          <p className={styles.price}>${product.price}</p>
        </div>
      </Link>

      <button
        className={`${styles.cartBtn} ${hover ? styles.cartBtnVisible : ""}`}
        onClick={(e) => {
          e.preventDefault();
          addToCart(product);
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}
function Icon({ children, label, active, onEnter, onLeave, onClick }) {
  return (
    <div
      className={`${styles.icon} ${active ? styles.iconActive : ""}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {active && <span className={styles.tooltip}>{label}</span>}
      {children}
    </div>
  );
}
