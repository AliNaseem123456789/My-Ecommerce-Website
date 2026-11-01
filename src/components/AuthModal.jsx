import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { CartContext } from "./context/CartContext";
import { AuthService } from "../services/auth.service";

import styles from "../styles/AuthModal.module.css";

function storeToken(token, staySignedIn) {
  const keep = staySignedIn ? localStorage : sessionStorage;
  const drop = staySignedIn ? sessionStorage : localStorage;
  keep.setItem("token", token);
  drop.removeItem("token");
}

export default function AuthModal({ onClose }) {
  const { setUser } = useContext(AuthContext);
  const { userId: guestId, mergeCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const finish = async (data) => {
    storeToken(data.access_token, staySignedIn);
    setUser(data.user);
    if (mergeCart && guestId && guestId !== data.user.id) {
      await mergeCart(guestId, data.user.id);
    }
    onClose(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setErrorMessage("");
    setNotice("");
    if (mode === "signup" && !acceptedTerms) {
      setErrorMessage("Please agree to the Privacy Policy and Terms of Use.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "forgot") {
        await AuthService.forgotPassword(email);
        setNotice("If an account exists for that email, a reset link is on its way.");
        return;
      }
      const data =
        mode === "login"
          ? await AuthService.login(email, password)
          : await AuthService.signup(name, email, password);
      await finish(data);
    } catch (err) {
      const message = err.response?.data?.message;
      setErrorMessage(
        Array.isArray(message)
          ? message.join(", ")
          : message || (mode === "login" ? "Invalid email or password." : "Signup failed."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} type="button">
          ✕
        </button>

        <h2 className={styles.title}>
          {mode === "login" ? "Sign In" : mode === "signup" ? "Sign Up" : "Reset Password"}
        </h2>

        {mode !== "forgot" && (
          <p className={styles.switchText}>
            {mode === "login" ? (
              <>
                Don’t have an account yet?{" "}
                <span
                  className={styles.switchLink}
                  onClick={() => {
                    setMode("signup");
                    setErrorMessage("");
                  }}
                >
                  Sign up for free
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  className={styles.switchLink}
                  onClick={() => {
                    setMode("login");
                    setErrorMessage("");
                  }}
                >
                  Log in
                </span>
              </>
            )}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          )}

          <input
            type="email"
            placeholder="Your username or email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />

          {mode !== "forgot" && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          )}

          {mode === "login" && (
            <div className={styles.loginOptions}>
              <label>
                <input
                  type="checkbox"
                  checked={staySignedIn}
                  onChange={(e) => setStaySignedIn(e.target.checked)}
                />{" "}
                Stay signed in
              </label>
              <span
                className={styles.forgot}
                onClick={() => {
                  setMode("forgot");
                  setErrorMessage("");
                  setNotice("");
                }}
              >
                Forgot your password?
              </span>
            </div>
          )}

          {mode === "signup" && (
            <label className={styles.terms}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />{" "}
              Yes, I agree with Privacy Policy and Terms of Use
            </label>
          )}

          {errorMessage && <div className={styles.error}>{errorMessage}</div>}
          {notice && <div>{notice}</div>}

          <button className={styles.submitBtn} type="submit" disabled={submitting}>
            {submitting
              ? "Please wait..."
              : mode === "login"
                ? "LOG IN"
                : mode === "signup"
                  ? "SIGN UP"
                  : "SEND RESET LINK"}
          </button>
        </form>
        {mode === "forgot" && (
          <button
            type="button"
            className={styles.switchLink}
            onClick={() => navigate("/reset-password")}
          >
            I already have a reset link
          </button>
        )}
      </div>
    </div>
  );
}
