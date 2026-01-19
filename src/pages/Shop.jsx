import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { Box, Typography, Select, MenuItem } from "@mui/material";

import ProductCard from "../components/ProductCard";
import CategoryFilter from "../components/CategoryFilter";
import QuickViewModal from "../components/QuickViewModal";
import { CartContext } from "../components/context/CartContext";
import { ShopService } from "../services/shop.service";

import {
  TwoLineIcon,
  ThreeLineIcon,
  FourLineIcon,
  HamburgerIcon,
} from "../components/icons/GridIcons";

function Shop() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category");

  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [selectedCategories, setSelectedCategories] = useState(
    initialCategory ? [Number(initialCategory)] : [],
  );

  const [grid, setGrid] = useState(3);
  const [sort, setSort] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categories.length) loadProducts();
  }, [categories, selectedCategories, sort]);

  const loadCategories = async () => {
    const data = await ShopService.getCategories();
    setCategories(data || []);
  };

  const loadProducts = async () => {
    const data = await ShopService.getProducts({
      categories: selectedCategories,
      sort,
    });

    const extended = (data || []).map((p) => {
      const formats = ["avif", "webp", "jpg", "jpeg", "png"];
      const maxImages = 6;

      const staticImages = Array.from({ length: maxImages }).flatMap(
        (_, index) =>
          formats.map(
            (ext) =>
              `/assets/products/${p.product_id}/${index === 0 ? "main" : index}.${ext}`,
          ),
      );

      const category = categories.find((c) => c.category_id === p.category_id);

      return {
        ...p,
        staticImages,
        categoryName: category?.name || "Uncategorized",
      };
    });

    setProducts(extended);
  };

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const gridOptions = isMobile ? [2, "list"] : [2, 3, 4, "list"];

  const getIcon = (value) => {
    switch (value) {
      case "list":
        return <HamburgerIcon />;
      case 2:
        return <TwoLineIcon />;
      case 3:
        return <ThreeLineIcon />;
      case 4:
        return <FourLineIcon />;
      default:
        return null;
    }
  };

  return (
    <Box width="100%" px={3} pb={5}>
      <Typography variant="h3" align="center" fontWeight={700} mb={5}>
        Shop
      </Typography>
      <Box display="flex" gap={3}>
        {!isMobile && (
          <Box width="22%">
            <CategoryFilter
              categories={categories}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />
          </Box>
        )}

        <Box flex={1}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography>Showing {products.length} results</Typography>

            <Select
              size="small"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="price_asc">Price Low → High</MenuItem>
              <MenuItem value="price_desc">Price High → Low</MenuItem>
              <MenuItem value="rating">Top Rating</MenuItem>
            </Select>
          </Box>
          <Box
            display="grid"
            gridTemplateColumns={
              grid === "list" ? "1fr" : `repeat(${grid}, 1fr)`
            }
            gap={3}
          >
            {products.map((p) => (
              <ProductCard
                key={p.product_id}
                product={{ ...p, images: p.staticImages }}
                addToCart={addToCart}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </Box>
        </Box>
      </Box>
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </Box>
  );
}

export default Shop;
