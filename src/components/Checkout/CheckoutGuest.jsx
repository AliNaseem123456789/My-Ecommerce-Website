import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../../styles/CheckoutGuest.css";

export default function CheckoutGuest() {
  const { user, loading } = useContext(AuthContext);

  if (loading || user) return null;

  return (
    <div className="checkout-guest-wrapper">
      <div className="checkout-card checkout-section-signin">
        <h2 className="checkout-title">Checkout</h2>
        <p className="checkout-subtitle">
          Have an Account? 🐾 <br />
          Sign in to check out faster or continue as a guest.
        </p>
        <button className="signin-btn">Sign In or Create Account</button>
      </div>
      <div className="checkout-card checkout-section-guest">
        <h3 className="guest-title">Guest Checkout</h3>
        <p className="guest-subtitle">
          Enter your contact information to continue.
        </p>

        <input
          type="text"
          placeholder="First and Last Name"
          className="checkout-input"
        />

        <input
          type="email"
          placeholder="Email"
          className="checkout-input"
          style={{ marginBottom: "15px" }}
        />

        <button className="guest-btn">Checkout As Guest</button>

        <div className="divider"></div>
      </div>
    </div>
  );
}
