import React, { useContext, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../components/context/AuthContext";

import { productService } from "../services/product.service";
import {
  productImageFrom,
  productImagesFrom,
} from "../utils/productImage";
import { Helmet } from "react-helmet-async";
import { track } from "@vercel/analytics";
import RecentlyViewed from "../components/RecentlyViewed";
import { rememberProduct } from "../utils/recentProducts";
import { reviewService } from "../services/review.service";
import { questionService } from "../services/question.service";

import ReviewModal from "../components/ReviewModal";
import QuestionModal from "../components/QuestionModal";
import Breadcrumbs from "../components/Breadcrumbs";
import LiveViewers from "../components/LiveViewers";

import ProductGallery from "../components/ProductDetails/ProductGallery";
import WishlistButton from "../components/ProductDetails/WishlistButton";
import AddToCartButton from "../components/ProductDetails/AddToCartButton";
import ProductTabs from "../components/ProductDetails/ProductTabs";

import logo from "../assets/Logos/paycard2.png";
import {
  Box,
  Typography,
  Paper,
  Rating,
  Stack,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";

function ProductDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [related, setRelated] = useState([]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError("");
      try {
        console.log("Fetching Product ID:", id);

        const [prodData, reviewData, questionData] = await Promise.all([
          productService.getProductById(id),
          reviewService.getReviews(id),
          questionService.getQuestions(id),
        ]);

        console.log("Received Data:", prodData);

        if (!prodData) {
          setProduct(null);
        } else {
          setProduct(prodData);
          setReviews(reviewData || []);
          setQuestions(questionData || []);
          loadProductImages(prodData);
          rememberProduct(prodData);
          track("view_item", {
            product_id: String(prodData.product_id),
            value: Number(prodData.price) || 0,
          });
          productService
            .getRelated(id)
            .then((rows) => setRelated(Array.isArray(rows) ? rows : []))
            .catch(() => setRelated([]));
        }
      } catch (err) {
        console.error("FULL ERROR OBJECT:", err);
        setProduct(null);
        setError("This product could not be loaded. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [id]);

  const loadProductImages = (item) => {
    const gallery = productImagesFrom(item);
    setProductImages(gallery.length ? gallery : [productImageFrom(item)]);
    setSelectedImageIndex(0);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography textAlign="center" mt={6}>
        {error}
      </Typography>
    );
  }

  if (!product)
    return (
      <Typography textAlign="center" mt={6}>
        Product not found.
      </Typography>
    );

  const site = "https://my-ecommerce-website-three.vercel.app";
  const reviewCount = product.review_count ?? reviews.length;
  const productJson = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    image: productImageFrom(product),
    sku: String(product.product_id),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: Number(product.price),
      availability:
        Number(product.stock) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${site}/product/${product.product_id}`,
    },
  };
  if (reviewCount > 0) {
    productJson.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(product.avg_rating) || 0,
      reviewCount,
    };
  }
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${site}/shop` },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${site}/product/${product.product_id}`,
      },
    ],
  };

  return (
    <Box sx={{ maxWidth: 1300, mx: "auto", p: 3 }}>
      <Helmet>
        <title>{`${product.name} | Shop`}</title>
        <meta name="description" content={product.description || product.name} />
        <link rel="canonical" href={`${site}/product/${product.product_id}`} />
        <script type="application/ld+json">{JSON.stringify(productJson)}</script>
        <script type="application/ld+json">{JSON.stringify(crumbs)}</script>
      </Helmet>
      <Breadcrumbs productName={product.name} />

      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <ProductGallery
          images={productImages}
          selectedIndex={selectedImageIndex}
          onSelect={setSelectedImageIndex}
          name={product.name}
        />

        <Box sx={{ flex: "1 1 300px", minWidth: 280 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h4" fontWeight={700}>
              {product.name}
            </Typography>
            <WishlistButton productId={product.product_id} />
          </Stack>

          <Typography variant="h5" fontWeight={700} color="primary" mt={1}>
            ${product.price}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <Rating value={Number(product.avg_rating) || 0} readOnly />
            <Typography>
              ({product.review_count ?? reviews.length} reviews)
            </Typography>
          </Stack>

          <LiveViewers />

          <Box mt={3}>
            <AddToCartButton product={product} />
            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                borderRadius: "50px",
                height: "52px",
                background: "black",
                ":hover": { background: "#333" },
              }}
            >
              BUY NOW
            </Button>
          </Box>

          <Stack direction="row" spacing={3} mt={3}>
            <WishlistButton productId={product.product_id} showLabel />
            <Button onClick={() => setShowQuestionModal(true)}>
              Ask a Question
            </Button>
          </Stack>

          <Paper
            sx={{ mt: 3, p: 2, textAlign: "center", border: "1px solid #eee" }}
            elevation={0}
          >
            <img src={logo} width="220" height="40" alt="Accepted payment cards" loading="lazy" />
            <Typography fontSize={14} color="gray">
              Guaranteed safe & secure checkout
            </Typography>
          </Paper>
        </Box>
      </Box>

      {}
      <Box mt={6}>
        <ProductTabs value={tabIndex} onChange={setTabIndex} />

        {tabIndex === 0 && (
          <Paper sx={{ p: 4, mt: 2 }} elevation={0} variant="outlined">
            <Typography lineHeight={1.8}>{product.description}</Typography>
          </Paper>
        )}

        {tabIndex === 1 && (
          <Box mt={2}>
            <Button
              variant="contained"
              onClick={() => {
                setEditingReview(null);
                setShowReviewModal(true);
              }}
            >
              Write a Review
            </Button>
            <Stack spacing={2} mt={3}>
              {reviews.length > 0 ? (
                reviews.map((r) => (
                  <Paper
                    key={r.id || r.review_id}
                    sx={{ p: 3 }}
                    variant="outlined"
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700}>{r.title}</Typography>
                      <Rating value={r.rating} size="small" readOnly />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {r.name}
                      {r.verified ? (
                        <Chip
                          label="Verified purchase"
                          size="small"
                          color="success"
                          sx={{ ml: 1 }}
                        />
                      ) : null}
                    </Typography>
                    <Typography mt={1}>{r.review}</Typography>
                    {user?.id && r.user_id === user.id ? (
                      <Stack direction="row" spacing={1} mt={1}>
                        <Button
                          size="small"
                          onClick={() => {
                            setEditingReview(r);
                            setShowReviewModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={async () => {
                            await reviewService.deleteReview(r.review_id);
                            setReviews(
                              reviews.filter((row) => row.review_id !== r.review_id),
                            );
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    ) : null}
                  </Paper>
                ))
              ) : (
                <Typography color="gray">No reviews yet.</Typography>
              )}
            </Stack>
          </Box>
        )}

        {tabIndex === 2 && (
          <Box mt={2}>
            <Button
              variant="outlined"
              onClick={() => setShowQuestionModal(true)}
            >
              Ask a Question
            </Button>
            <Stack spacing={2} mt={3}>
              {questions.length > 0 ? (
                questions.map((q) => (
                  <Paper
                    key={q.id || q.question_id}
                    sx={{ p: 3 }}
                    variant="outlined"
                  >
                    <Typography fontWeight={700}>{q.name} asks:</Typography>
                    <Typography mt={1}>{q.question}</Typography>
                    {(q.product_answers || []).map((answer) => (
                      <Box
                        key={answer.id}
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: "#f9f9f9",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          Support Team:
                        </Typography>
                        <Typography variant="body2">{answer.answer}</Typography>
                      </Box>
                    ))}
                  </Paper>
                ))
              ) : (
                <Typography color="gray">No questions yet.</Typography>
              )}
            </Stack>
          </Box>
        )}
      </Box>

      {}
      {showReviewModal && (
        <ReviewModal
          productId={id}
          existing={editingReview}
          onClose={() => {
            setShowReviewModal(false);
            setEditingReview(null);
          }}
          onAdded={(r) =>
            setReviews(
              editingReview
                ? reviews.map((row) =>
                    row.review_id === r.review_id ? r : row,
                  )
                : [r, ...reviews],
            )
          }
        />
      )}

      {showQuestionModal && (
        <QuestionModal
          productId={id}
          onClose={() => setShowQuestionModal(false)}
          onAdded={(q) => setQuestions([q, ...questions])}
        />
      )}
      {related.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6">Related products</Typography>
          <Stack direction="row" spacing={2} mt={1} sx={{ overflowX: "auto" }}>
            {related.map((item) => (
              <Box key={item.product_id} component={Link} to={`/product/${item.product_id}`} sx={{ minWidth: 140 }}>
                <img
                  src={productImageFrom(item)}
                  alt={item.name}
                  width="140"
                  height="140"
                  loading="lazy"
                />
                <Typography>{item.name}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
      <RecentlyViewed excludeId={product.product_id} />
    </Box>
  );
}

export default ProductDetails;
