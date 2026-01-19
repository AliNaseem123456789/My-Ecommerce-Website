import React, { useState } from "react";
import { reviewService } from "../services/review.service";
import styles from "../styles/components.module.css";

export default function ReviewModal({ productId, onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    review: "",
    rating: 5,
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await reviewService.submitReview(productId, form);
      onAdded(data);
      onClose();
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to post review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Write a Review</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            className={styles.modalInput}
            disabled={loading}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className={styles.modalInput}
            disabled={loading}
          />

          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
            className={styles.modalInput}
            disabled={loading}
          />

          <textarea
            name="review"
            placeholder="Your review"
            value={form.review}
            onChange={handleChange}
            required
            className={`${styles.modalInput} ${styles.modalTextarea}`}
            disabled={loading}
          />

          <label className={styles.ratingRow}>
            Rating:
            <input
              type="number"
              name="rating"
              min="1"
              max="5"
              value={form.rating}
              onChange={handleChange}
              className={styles.ratingInput}
              disabled={loading}
            />
          </label>

          <div className={styles.modalActions}>
            <button
              type="submit"
              className={styles.modalSubmitBtn}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.modalCancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
