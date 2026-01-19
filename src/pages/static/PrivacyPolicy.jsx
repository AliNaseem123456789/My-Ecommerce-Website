import { Box, Typography, Divider } from "@mui/material";
import "../../styles/StaticPages.css";

export default function PrivacyPolicy() {
  return (
    <div className="static-container">
      <h1 className="static-title">Privacy Policy</h1>
      <span className="static-date">Last Updated: 12/21/2025</span>

      <p className="static-text">
        Welcome to My Personal E-Commerce Project (“Website,” “we,” “us,” or
        “our”). This Privacy Policy explains how we collect, use, and protect
        the information you provide when using our website and services.
      </p>

      <Divider sx={{ my: 4 }} />

      <h2 className="static-subtitle">1. Information We Collect</h2>
      <p className="static-text">
        We collect information to provide a better shopping experience,
        including:
        <br />
        ● Personal information you provide (name, email, shipping address).
        <br />
        ● Automatically collected data (browser type, IP address).
        <br />● Cookies and tracking technologies.
      </p>

      <h2 className="static-subtitle">2. How We Use Your Information</h2>
      <p className="static-text">
        Your information is used to process orders, communicate updates, improve
        website features, and prevent fraud.
      </p>

      <h2 className="static-subtitle">3. Contact</h2>
      <p className="static-text">
        For questions regarding this policy, contact us at:{" "}
        <strong>your-email@example.com</strong>
      </p>
    </div>
  );
}
