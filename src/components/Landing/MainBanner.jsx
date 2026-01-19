import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import styles from "../../styles/LandingPage.module.css";

export default function MainBanner({ heroImages }) {
  const navigate = useNavigate();
  const [currentHero, setCurrentHero] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sentenceVariant = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.03 },
    },
    exit: { opacity: 0, y: -20 },
  };

  const letterVariant = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section
      className={styles.bannerContainer}
      style={{ height: isMobile ? "70vh" : "100vh" }}
    >
      {heroImages.map((slide, index) => (
        <motion.img
          key={index}
          src={slide.image}
          alt=""
          className={styles.heroImage}
          style={{
            objectPosition: isMobile ? "85% center" : "right center",
          }}
          animate={{ opacity: index === currentHero ? 1 : 0 }}
          transition={{ duration: 1.5 }}
        />
      ))}

      {/* TEXT CONTENT */}
      <div
        className={styles.bannerTextBox}
        style={{
          width: isMobile ? "88%" : "40%",
          left: isMobile ? "5%" : "6%",
          top: isMobile ? "55%" : "50%",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHero}
            variants={sentenceVariant}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <motion.h1
              className={styles.bannerTitle}
              style={{ fontSize: isMobile ? "32px" : "62px" }}
            >
              {heroImages[currentHero].title.split("").map((char, i) => (
                <motion.span key={i} variants={letterVariant}>
                  {char}
                </motion.span>
              ))}
            </motion.h1>

            <motion.h2
              className={styles.bannerSubtitle}
              style={{ fontSize: isMobile ? "18px" : "28px" }}
            >
              {heroImages[currentHero].subtitle.split("").map((char, i) => (
                <motion.span key={i} variants={letterVariant}>
                  {char}
                </motion.span>
              ))}
            </motion.h2>

            <motion.p
              className={styles.bannerDescription}
              style={{
                fontSize: isMobile ? "14px" : "18px",
                maxWidth: isMobile ? "100%" : "500px",
              }}
            >
              {heroImages[currentHero].description.split("").map((char, i) => (
                <motion.span key={i} variants={letterVariant}>
                  {char}
                </motion.span>
              ))}
            </motion.p>

            <div
              className={styles.bannerButtons}
              style={{
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "8px" : "12px",
              }}
            >
              <button
                className={styles.primaryBtn}
                onClick={() =>
                  navigate(`/product/${heroImages[currentHero].productId}`)
                }
              >
                Shop Now
              </button>

              <button
                className={styles.secondaryBtn}
                onClick={() => navigate("/shop")}
              >
                Shop More
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
