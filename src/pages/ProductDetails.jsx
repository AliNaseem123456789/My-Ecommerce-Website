import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { productService } from "../services/product.service";
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
  CircularProgress,
} from "@mui/material";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
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
          loadProductImages(id);
        }
      } catch (err) {
        console.error("FULL ERROR OBJECT:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [id]);

  const createImageUrl = (filename) => {
    try {
      return new URL(`/src/assets/products/${filename}`, import.meta.url).href;
    } catch {
      return null;
    }
  };

  const loadProductImages = (productId) => {
    const files = [`${productId}.jpg`, `${productId}.png`, `${productId}.jpeg`];
    for (let i = 1; i <= 5; i++) {
      ["-", "_"].forEach((sep) => {
        ["jpg", "png", "jpeg"].forEach((ext) => {
          files.push(`${productId}${sep}${i}.${ext}`);
        });
      });
    }
    const images = files.map(createImageUrl).filter(Boolean);
    setProductImages(
      images.length
        ? [...new Set(images)]
        : ["https://via.placeholder.com/600"],
    );
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

  if (!product)
    return (
      <Typography textAlign="center" mt={6}>
        Product not found.
      </Typography>
    );

  return (
    <Box sx={{ maxWidth: 1300, mx: "auto", p: 3 }}>
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
            <Typography>({reviews.length} reviews)</Typography>
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
            <img src={logo} width="220" alt="payments" />
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
              onClick={() => setShowReviewModal(true)}
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
                    </Typography>
                    <Typography mt={1}>{r.review}</Typography>
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
                    {q.answer && (
                      <Box
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
                        <Typography variant="body2">{q.answer}</Typography>
                      </Box>
                    )}
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
          onClose={() => setShowReviewModal(false)}
          onAdded={(r) => setReviews([r, ...reviews])}
        />
      )}

      {showQuestionModal && (
        <QuestionModal
          productId={id}
          onClose={() => setShowQuestionModal(false)}
          onAdded={(q) => setQuestions([q, ...questions])}
        />
      )}
    </Box>
  );
}

export default ProductDetails;
