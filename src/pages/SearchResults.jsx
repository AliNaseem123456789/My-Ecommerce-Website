import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Rating,
  TextField,
  MenuItem,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { searchService } from "../services/search.service";
import AddToCartButton from "../components/ProductDetails/AddToCartButton";

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "relevance",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" },
    { value: "name_desc", label: "Name: Z to A" },
    { value: "rating_desc", label: "Highest Rated" },
  ];

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchService.searchProducts(searchQuery, filters);
      setProducts(results || []);
      setTotalPages(Math.ceil((results?.length || 0) / 12));
    } catch (error) {
      console.error("Search failed:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch();
    }
  }, [initialQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    performSearch();
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
    setTimeout(performSearch, 100);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Search Results
      </Typography>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: "24px" }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 3, minWidth: "200px" }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "black",
              "&:hover": { bgcolor: "#333" },
              px: 4,
            }}
          >
            Search
          </Button>
        </Box>
      </form>

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
          p: 2,
          bgcolor: "#f5f5f5",
          borderRadius: 2,
        }}
      >
        <TextField
          select
          label="Sort By"
          value={filters.sortBy}
          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Min Price"
          type="number"
          value={filters.minPrice}
          onChange={(e) => handleFilterChange("minPrice", e.target.value)}
          size="small"
          sx={{ width: 120 }}
        />

        <TextField
          label="Max Price"
          type="number"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
          size="small"
          sx={{ width: 120 }}
        />

        {(filters.minPrice || filters.maxPrice || filters.sortBy !== "relevance") && (
          <Button
            size="small"
            onClick={() => {
              setFilters({ category: "", minPrice: "", maxPrice: "", sortBy: "relevance" });
              setTimeout(performSearch, 100);
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Results */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : products.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No products found for "{searchQuery}"
          </Typography>
          <Typography color="text.secondary" mt={1}>
            Try different keywords or browse our categories.
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Found {products.length} results for "{searchQuery}"
          </Typography>

          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.product_id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    "&:hover": { boxShadow: 6 },
                  }}
                  onClick={() => navigate(`/product/${product.product_id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image_url || "/placeholder.jpg"}
                    alt={product.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {product.name}
                    </Typography>
                    <Rating value={product.avg_rating || 0} readOnly size="small" />
                    <Typography variant="h6" color="primary" mt={1}>
                      ${product.price}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <AddToCartButton product={product} />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => {
                  setPage(value);
                  window.scrollTo(0, 0);
                }}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}