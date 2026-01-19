import addtocart from "../../assets/Logos/cart.jpeg";
import browseproducts from "../../assets/Logos/browseproduct.jpeg";
import fastsecure from "../../assets/Logos/fastsecure.png";
import { steps } from "../../data/stepsData";
import styles from "../styles/LandingPage.module.css";
export default function HowItWorks() {
  return (
    <section className={styles.howItWorks}>
      <h2 className={styles.howItWorksTitle}>How It Works</h2>

      <div className={styles.howItWorksSteps}>
        {steps.map((step, idx) => (
          <div key={idx} className={styles.howItWorksCard}>
            <img
              src={step.image}
              alt={step.title}
              className={styles.howItWorksImage}
            />

            <h3 className={styles.howItWorksCardTitle}>{step.title}</h3>

            <p className={styles.howItWorksDescription}>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
