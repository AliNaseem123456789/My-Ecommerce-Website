import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { Box, Typography, Select, MenuItem, TextField, Pagination, CircularProgress } from "@mui/material";

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
  // Landing-page links such as /shop?minPrice=25&maxPrice=50 and
  // /shop?sort=rating need to arrive with their filters already applied.
  const [sort, setSort] = useState(queryParams.get("sort") || "");
  const [minPrice, setMinPrice] = useState(queryParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(queryParams.get("maxPrice") || "");
  const brand = queryParams.get("brand") || "";
  const collection = queryParams.get("collection") || "";
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategories, sort, minPrice, maxPrice, page, categories, brand, collection]);

  const loadCategories = async () => {
    try {
      const data = await ShopService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await ShopService.getProducts({
        categories: selectedCategories,
        sort,
        minPrice,
        maxPrice,
        brand,
        collection,
        page,
        limit: 12,
      });
      const extended = (data?.items || []).map((p) => {
        const category = categories.find((c) => c.category_id === p.category_id);
        return {
          ...p,
          categoryName: category?.name || "Uncategorized",
        };
      });
      setProducts(extended);
      setTotal(data?.total || 0);
      setLimit(data?.limit || 12);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setTotal(0);
      setError("Products could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
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
            <Typography>
              {loading ? "Loading products..." : `Showing ${products.length} of ${total} results`}
            </Typography>

            <Box display="flex" gap={1} alignItems="center">
              <TextField
                size="small"
                label="Min"
                type="number"
                value={minPrice}
                onChange={(e) => {
                  setPage(1);
                  setMinPrice(e.target.value);
                }}
                sx={{ width: 90 }}
              />
              <TextField
                size="small"
                label="Max"
                type="number"
                value={maxPrice}
                onChange={(e) => {
                  setPage(1);
                  setMaxPrice(e.target.value);
                }}
                sx={{ width: 90 }}
              />
              <Select
                size="small"
                value={sort}
                onChange={(e) => {
                  setPage(1);
                  setSort(e.target.value);
                }}
              >
                <MenuItem value="">Default</MenuItem>
                <MenuItem value="price_asc">Price Low → High</MenuItem>
                <MenuItem value="price_desc">Price High → Low</MenuItem>
                <MenuItem value="rating">Top Rating</MenuItem>
              </Select>
            </Box>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography textAlign="center" py={6}>
              {error}
            </Typography>
          ) : products.length === 0 ? (
            <Typography textAlign="center" py={6}>
              No products match these filters.
            </Typography>
          ) : (
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
                  product={p}
                  addToCart={addToCart}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </Box>
          )}
          {total > limit && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={Math.ceil(total / limit)}
                page={page}
                onChange={(_event, value) => setPage(value)}
              />
            </Box>
          )}
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
