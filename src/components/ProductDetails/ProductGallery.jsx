import { Box, Paper } from "@mui/material";

function ProductGallery({ images, selectedIndex, onSelect, name }) {
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      {images.length > 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${name} thumbnail ${i + 1}`}
              width="80"
              height="80"
              loading="lazy"
              onClick={() => onSelect(i)}
              style={{
                width: 80,
                height: 80,
                borderRadius: 10,
                cursor: "pointer",
                border:
                  selectedIndex === i
                    ? "2px solid #1976d2"
                    : "1px solid #e0e0e0",
              }}
            />
          ))}
        </Box>
      )}

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <img
          src={images[selectedIndex]}
          alt={name}
          width="500"
          height="500"
          style={{ width: "100%", maxWidth: 500, borderRadius: 14 }}
        />
      </Paper>
    </Box>
  );
}

export default ProductGallery;
