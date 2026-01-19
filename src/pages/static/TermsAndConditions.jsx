import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/StaticPages.css";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="static-container">
      <h1 className="static-title">Terms & Conditions</h1>
      <span className="static-date">Last Updated: 12/21/2025</span>

      <p className="static-text">
        Welcome to My Personal E-Commerce Project ("Website," "we," "us," or
        "our"). By accessing or using our website, you agree to comply with
        these Terms & Conditions ("Terms").
      </p>

      <p className="static-text">
        If you do not agree to these Terms, please do not use our Site or
        purchase products.
      </p>

      <div className="static-divider" />

      <h2 className="static-subtitle">1. Use of the Site</h2>
      <p className="static-text">By using this Website, you confirm that:</p>
      <ul className="static-list">
        <li>
          You are at least the age of majority in your country of residence.
        </li>
        <li>You will not use the Website for unlawful purposes.</li>
        <li>You will not transmit malware, viruses, or harmful code.</li>
      </ul>

      <div className="static-divider" />

      <h2 className="static-subtitle">2. Products & Pricing</h2>
      <p className="static-text">
        Product descriptions, pricing, and availability are subject to change
        without notice. Colors and images are provided for general guidance and
        may vary slightly from actual products.
      </p>

      <div className="static-divider" />

      <h2 className="static-subtitle">3. Returns & Refunds</h2>
      <p className="static-text">
        Our Returns and Refund Policy governs returns and exchanges. You can
        view the full policy here:
        <span
          className="static-link"
          onClick={() => navigate("/refund-returns")}
        >
          Refund Policy
        </span>
      </p>

      <div className="static-divider" />

      <h2 className="static-subtitle">4. User Accounts</h2>
      <p className="static-text">
        Users creating accounts must provide accurate information and maintain
        security of login credentials. You are responsible for all activity on
        your account.
      </p>

      <div className="static-divider" />

      <h2 className="static-subtitle">5. Privacy</h2>
      <p className="static-text">
        Your personal information is governed by our
        <span
          className="static-link"
          onClick={() => navigate("/privacy-policy")}
        >
          Privacy Policy
        </span>
        .
      </p>

      <div className="static-divider" />

      <h2 className="static-subtitle">6. Contact</h2>
      <p className="static-text">
        Questions about these Terms can be sent to us via our
        <span className="static-link" onClick={() => navigate("/contact-us")}>
          Contact Form
        </span>
        .
      </p>
    </div>
  );
}
