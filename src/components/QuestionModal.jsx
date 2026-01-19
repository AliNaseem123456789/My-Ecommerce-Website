import React, { useState } from "react";
import { questionService } from "../services/question.service";
import styles from "../styles/components.module.css";
export default function QuestionModal({ productId, onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    question: "",
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await questionService.askQuestion(productId, form);
      onAdded(data);
      onClose();
    } catch (error) {
      console.error("Error asking question:", error);
      alert("Failed to submit question. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Ask a Question</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
            className={styles.modalInput}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            className={styles.modalInput}
          />
          <textarea
            name="question"
            placeholder="Your question"
            value={form.question}
            onChange={handleChange}
            required
            disabled={loading}
            className={`${styles.modalInput} ${styles.modalTextarea}`}
          />
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
