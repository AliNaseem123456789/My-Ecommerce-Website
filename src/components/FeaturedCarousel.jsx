import React, { useState, useEffect, useRef } from "react";
import ProductCard from "../components/ProductCard";
import styles from "../styles/components.module.css";

export default function FeaturedCarousel({ products, addToCart }) {
  if (!products || products.length === 0) {
    return <div className={styles.carouselEmpty}>No products available</div>;
  }

  const limitedProducts = products.slice(0, 9);
  const [currentIndex, setCurrentIndex] = useState(0);
  const length = limitedProducts.length;
  const timeoutRef = useRef(null);

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev === length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => resetTimeout();
  }, [currentIndex, length]);

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? length - 1 : currentIndex - 1);
  };

  const nextSlide = () => {
    setCurrentIndex(currentIndex === length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <div className={styles.carouselWrapper}>
      <div className={styles.carouselViewport}>
        <div
          className={styles.carouselTrack}
          style={{
            transform: `translateX(-${currentIndex * 260}px)`,
          }}
        >
          {limitedProducts.map((p, index) => (
            <div key={index} className={styles.carouselSlide}>
              <ProductCard product={p} addToCart={addToCart} />
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className={`${styles.carouselArrow} ${styles.leftArrow}`}
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className={`${styles.carouselArrow} ${styles.rightArrow}`}
      >
        ❯
      </button>

      {/* Dots */}
      <div className={styles.carouselDots}>
        {limitedProducts.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`${styles.carouselDot} ${
              idx === currentIndex ? styles.carouselDotActive : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
