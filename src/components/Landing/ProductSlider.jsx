import { Box, Paper } from "@mui/material";
import styles from "../../styles/productUI.module.css";

function ProductGallery({ images, selectedIndex, onSelect, name }) {
  return (
    <Box className={styles.galleryWrapper}>
      {images.length > 1 && (
        <Box className={styles.thumbs}>
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${name} thumbnail ${i + 1}`}
              onClick={() => onSelect(i)}
              className={`${styles.thumb} ${
                selectedIndex === i ? styles.thumbActive : ""
              }`}
            />
          ))}
        </Box>
      )}

      <Paper className={styles.mainImageWrapper} elevation={0}>
        <img
          src={images[selectedIndex]}
          alt={name}
          className={styles.mainImage}
        />
      </Paper>
    </Box>
  );
}

export default ProductGallery;
