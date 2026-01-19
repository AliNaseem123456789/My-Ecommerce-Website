export default function HeroBanner({ heroImages, currentHero, navigate, styles }) {
  return (
    <section style={styles.heroFullScreen}>
      {heroImages.map((img, index) => (
        <img
          key={index}
          src={img}
          style={{
            ...styles.heroImage,
            opacity: index === currentHero ? 1 : 0,
          }}
        />
      ))}
      <div style={styles.heroButtonWrapper}>
        <button style={styles.heroButton} onClick={() => navigate("/shop")}>
          Shop Now
        </button>
      </div>
    </section>
  );
}
