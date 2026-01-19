import React, { useState, useEffect } from "react";
import styles from "../../styles/LandingPage.module.css";
import { testimonials } from "../../data/testimoinialsData";
export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = testimonials.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(interval);
  }, [total]);

  return (
    <section className={styles.testimonialsSection}>
      <h2 className={styles.testimonialsTitle}>What Our Customers Say</h2>

      <div className={styles.testimonialsWrapper}>
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className={`${styles.testimonialCard} ${
              idx === currentIndex
                ? styles.activeTestimonial
                : styles.hiddenTestimonial
            }`}
          >
            <div className={styles.testimonialSpacer}></div>

            <p className={styles.testimonialText}>"{t.text}"</p>

            <p className={styles.testimonialName}>{t.name}</p>
            <p className={styles.testimonialRole}>{t.role}</p>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className={styles.testimonialDots}>
        {testimonials.map((_, idx) => (
          <span
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`${styles.testimonialDot} ${
              idx === currentIndex ? styles.activeDot : ""
            }`}
          />
        ))}
      </div>
    </section>
  );
}
