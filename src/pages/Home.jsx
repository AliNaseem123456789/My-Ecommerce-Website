import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../components/context/CartContext";
import ProductCard from "../components/ProductCard";

import MainBanner from "../components/Landing/MainBanner";
import LandingProductCard from "../components/Landing/LandingProductCard";
import SideBySide from "../components/Landing/SideBySide";
import BrandStatement from "../components/Landing/BrandStatements";
import WhyShopWithUs from "../components/Landing/WhyShopWithUs";

import { heroImages } from "../data/heroData";
import { LandingService } from "../services/landing.service";
import Testimonials from "../components/Landing/Testimonials";
import styles from "../styles/LandingPage.module.css";

export default function Home() {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [slideIndex, setSlideIndex] = useState(0);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const isMobile = windowWidth < 768;
  const visibleCount = isMobile ? 2 : 4;
  const featuredVisibleCount = isMobile ? 2 : 4;
  const FEATURED_IDS = [1, 2, 5, 23, 25, 26, 13, 8];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [catData, prodData, featData] = await Promise.all([
          LandingService.getCategories(),
          LandingService.getAllProducts(),
          LandingService.getFeaturedProducts(FEATURED_IDS),
        ]);

        setCategories(catData || []);
        setAllProducts(prodData || []);
        setFeaturedProducts(featData || []);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredAllProducts =
    selectedCategory === "all"
      ? allProducts
      : allProducts.filter(
          (p) => String(p.category_id) === String(selectedCategory),
        );

  const getVisibleProducts = () => {
    if (!filteredAllProducts.length) return [];
    return Array.from({ length: visibleCount }).map(
      (_, i) =>
        filteredAllProducts[(slideIndex + i) % filteredAllProducts.length],
    );
  };

  const getVisibleFeatured = () => {
    if (!featuredProducts.length) return [];
    return Array.from({ length: featuredVisibleCount }).map(
      (_, i) => featuredProducts[(featuredIndex + i) % featuredProducts.length],
    );
  };

  const handleNextFeatured = () => {
    if (featuredProducts.length <= featuredVisibleCount) return;
    setFeaturedIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const handlePrevFeatured = () => {
    if (featuredProducts.length <= featuredVisibleCount) return;
    setFeaturedIndex((prev) =>
      prev === 0 ? featuredProducts.length - 1 : prev - 1,
    );
  };

  useEffect(() => {
    if (featuredProducts.length <= featuredVisibleCount) return;
    const interval = setInterval(handleNextFeatured, 5000);
    return () => clearInterval(interval);
  }, [featuredIndex, featuredProducts.length]);

  if (isLoading) {
    return <div className={styles.loader}>Loading products...</div>;
  }

  return (
    <>
      <MainBanner heroImages={heroImages} />

      <section className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>All Products</h2>
      </section>

      {}
      <section className={styles.categorySection}>
        {isMobile ? (
          <div className={styles.mobileBubbleWrapper}>
            {["all", ...categories.map((c) => String(c.category_id))].map(
              (catId, index) => {
                const catName =
                  catId === "all"
                    ? "All"
                    : categories.find((c) => String(c.category_id) === catId)
                        ?.name;

                return (
                  <div
                    key={index}
                    className={`${styles.mobileBubble} ${
                      selectedCategory === catId ? styles.activeBubble : ""
                    }`}
                    onClick={() => {
                      setSelectedCategory(catId);
                      setSlideIndex(0);
                    }}
                  >
                    {catName}
                  </div>
                );
              },
            )}
          </div>
        ) : (
          <div className={styles.tabsWrapper}>
            <div className={styles.tabsContainer}>
              <div
                className={`${styles.tab} ${
                  selectedCategory === "all" ? styles.activeTab : ""
                }`}
                onClick={() => {
                  setSelectedCategory("all");
                  setSlideIndex(0);
                }}
              >
                All
              </div>

              {categories.map((cat) => (
                <div
                  key={cat.category_id}
                  className={`${styles.tab} ${
                    selectedCategory === String(cat.category_id)
                      ? styles.activeTab
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory(String(cat.category_id));
                    setSlideIndex(0);
                  }}
                >
                  {cat.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {}
      <section className={styles.productsSection}>
        {isMobile ? (
          <div className={styles.mobileGrid}>
            {filteredAllProducts.slice(0, 4).map((product) => (
              <div
                key={product.product_id}
                className={styles.mobileCardWrapper}
              >
                <ProductCard product={product} addToCart={addToCart} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.sliderRow}>
            {getVisibleProducts().map((product) => (
              <div
                key={product.product_id}
                className={styles.sliderItem}
                style={{ minWidth: `${100 / visibleCount}%` }}
              >
                <ProductCard product={product} addToCart={addToCart} />
              </div>
            ))}
          </div>
        )}
      </section>

      {}
      <section className={styles.graySection}>
        <SideBySide />

        <div className={styles.sectionSpacing}>
          <BrandStatement />
        </div>

        {}
        <section className={styles.bestSellersSection}>
          <h2 className={styles.bestTitle}>Best Sellers</h2>
          <p className={styles.bestSubtitle}>
            Our most loved products, hand-picked and trending right now.
          </p>

          <div className={styles.sliderContainer}>
            {featuredProducts.length > featuredVisibleCount && (
              <button
                className={`${styles.arrowButton} ${styles.left}`}
                onClick={handlePrevFeatured}
              >
                ‹
              </button>
            )}

            <div className={styles.sliderRow}>
              {getVisibleFeatured().map((product, index) => (
                <div
                  key={`${product.product_id}-${index}`}
                  className={styles.sliderItem}
                  style={{ minWidth: `${100 / featuredVisibleCount}%` }}
                >
                  <LandingProductCard product={product} />
                </div>
              ))}
            </div>

            {featuredProducts.length > featuredVisibleCount && (
              <button
                className={`${styles.arrowButton} ${styles.right}`}
                onClick={handleNextFeatured}
              >
                ›
              </button>
            )}
          </div>

          {featuredProducts.length > featuredVisibleCount && (
            <div className={styles.dotsContainer}>
              {Array.from({
                length: Math.ceil(
                  featuredProducts.length / featuredVisibleCount,
                ),
              }).map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${
                    Math.floor(featuredIndex / featuredVisibleCount) === i
                      ? styles.activeDot
                      : ""
                  }`}
                  onClick={() => setFeaturedIndex(i * featuredVisibleCount)}
                />
              ))}
            </div>
          )}
        </section>

        <div className={styles.sectionSpacing}>
          <Testimonials />
        </div>
      </section>
    </>
  );
}
