import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404</h1>
      <h2 style={styles.subtitle}>Page Not Found</h2>
      <p style={styles.description}>
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>
      <button style={styles.button} onClick={() => navigate("/Home")}>
        Go Back Home
      </button>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "0 20px",
    background: "#f9f9f9",
  },
  title: {
    fontSize: "100px",
    margin: 0,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: "32px",
    margin: "10px 0",
    color: "#666",
  },
  description: {
    fontSize: "18px",
    marginBottom: "20px",
    color: "#888",
  },
  button: {
    background: "#000",
    color: "#fff",
    padding: "12px 28px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  },
};
