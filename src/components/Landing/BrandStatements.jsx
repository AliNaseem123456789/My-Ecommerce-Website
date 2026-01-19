import mugbanner from "../../assets/banners/mugbanner.jpg";
import styles from "../../styles/LandingPage.module.css";

export default function BrandStatement() {
  return (
    <section className={styles.brandStatement}>
      <div className={styles.brandText}>
        <h2 className={styles.brandTitle}>
          Crafted With Passion.
          <br />
          Made for Your Lifestyle.
        </h2>
        <p className={styles.brandDescription}>
          We blend premium materials, artistic flair and modern functionality to
          bring you products that elevate your everyday life.
        </p>
      </div>
      <div className={styles.brandImageWrapper}>
        <img
          src={mugbanner}
          alt="brand statement"
          className={styles.brandImage}
        />
      </div>
    </section>
  );
}
