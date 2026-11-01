import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "../../styles/CheckoutGuest.css";

export default function CheckoutGuest({ onSignIn, onContinue }) {
  const { user, loading } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (loading || user) return null;

  return (
    <div className="checkout-guest-wrapper">
      <div className="checkout-card checkout-section-signin">
        <h2 className="checkout-title">Checkout</h2>
        <p className="checkout-subtitle">
          Have an Account? 🐾 <br />
          Sign in to check out faster or continue as a guest.
        </p>
        <button className="signin-btn" type="button" onClick={onSignIn}>
          Sign In or Create Account
        </button>
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
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="checkout-input"
          style={{ marginBottom: "15px" }}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <button
          className="guest-btn"
          type="button"
          onClick={() => onContinue({ name, email })}
        >
          Checkout As Guest
        </button>

        <div className="divider"></div>
      </div>
    </div>
  );
}
