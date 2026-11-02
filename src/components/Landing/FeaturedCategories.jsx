import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { CategoriesService } from "../../services/categories.service";

/**
 * Landing-page category showcase: one large tile followed by smaller ones.
 * Which categories appear, their order and their images are all managed in
 * Admin -> Categories. Renders nothing when none are flagged as featured.
 */
export default function FeaturedCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    CategoriesService.getFeatured()
      .then((rows) => {
        if (active) setCategories(Array.isArray(rows) ? rows.slice(0, 5) : []);
      })
      .catch(() => {
        if (active) setCategories([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading || categories.length === 0) return null;

  const tileSx = (index) => {
    const isHero = index === 0;
    return {
      position: "relative",
      overflow: "hidden",
      borderRadius: "4px",
      cursor: "pointer",
      backgroundColor: "#f3f4f6",
      minHeight: isHero
        ? { xs: 260, md: 440 }
        : { xs: 150, md: 210 },
      gridColumn: isHero ? { xs: "1 / -1", md: "1" } : "auto",
      gridRow: isHero ? { xs: "auto", md: "1 / span 2" } : "auto",
      "&:hover img": { transform: "scale(1.05)" },
    };
  };

  return (
    <Box
      component="section"
      sx={{ width: "100%", px: { xs: 2, md: 6 }, py: { xs: 5, md: 7 } }}
    >
      <Typography
        component="h2"
        sx={{
          textAlign: "center",
          fontSize: { xs: 18, md: 21 },
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#2f3542",
          mb: { xs: 3, md: 4.5 },
        }}
      >
        Featured Categories
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "2fr 1fr 1fr" },
          gridAutoRows: { xs: "auto", md: "1fr" },
          gap: { xs: 1.5, md: 2 },
          maxWidth: 1240,
          mx: "auto",
        }}
      >
        {categories.map((category, index) => (
          <Box
            key={category.category_id}
            onClick={() => navigate(`/shop?category=${category.category_id}`)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate(`/shop?category=${category.category_id}`);
              }
            }}
            role="link"
            tabIndex={0}
            aria-label={`Shop ${category.name}`}
            sx={tileSx(index)}
          >
            {category.image_url && (
              <Box
                component="img"
                src={category.image_url}
                alt={category.name}
                loading="lazy"
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform .4s ease",
                }}
              />
            )}

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(255,255,255,.92) 0%, rgba(255,255,255,.55) 22%, rgba(255,255,255,0) 48%)",
              }}
            />

            <Typography
              sx={{
                position: "absolute",
                left: { xs: 14, md: index === 0 ? 24 : 18 },
                bottom: { xs: 12, md: index === 0 ? 22 : 16 },
                fontSize: { xs: 13, md: index === 0 ? 20 : 14.5 },
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#2f3542",
              }}
            >
              {category.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
