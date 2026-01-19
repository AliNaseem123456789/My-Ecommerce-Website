import Glassbanner from "../../assets/products/30.jpeg";
import styles from "../../styles/LandingPage.module.css";

export default function SideBySide() {
  return (
    <section className={styles.sideSection}>
      <div className={styles.sideImageWrapper}>
        <img
          src={Glassbanner}
          alt="side section"
          className={styles.sideImage}
        />
      </div>
      <div className={styles.sideText}>
        <h2 className={styles.sideTitle}>Premium Quality Products</h2>

        <p className={styles.sideParagraph}>
          We pride ourselves on delivering products crafted with precision,
          durability, and modern design.
        </p>

        <p className={styles.sideParagraph}>
          From carefully sourced materials to our customer-first support, we aim
          to exceed expectations.
        </p>
      </div>
    </section>
  );
}
