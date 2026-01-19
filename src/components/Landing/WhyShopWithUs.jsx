import { FaCheckCircle, FaTruck, FaUndo, FaLock } from "react-icons/fa";
import styles from "../../styles/LandingPage.module.css";
import { features } from "../../data/featuresData";
export default function ShopWithConfidence() {
  return (
    <section className={styles.confidenceSection}>
      <h1 className={styles.confidenceTitle}>Shop With Confidence</h1>
      <p className={styles.confidenceSubtitle}>
        We ensure the best shopping experience with premium products, fast
        delivery, easy returns, and secure payment options.
      </p>
      <div className={styles.confidenceGrid}>
        {features.map((f, i) => (
          <div key={i} className={styles.confidenceCard}>
            <div className={styles.confidenceIcon}>{f.icon}</div>
            <h3 className={styles.confidenceCardTitle}>{f.title}</h3>
            <p className={styles.confidenceCardDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
