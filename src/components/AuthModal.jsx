import React, { useState, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { CartContext } from "./context/CartContext";
import { AuthService } from "../services/auth.service";

import styles from "../styles/AuthModal.module.css";

export default function AuthModal({ onClose }) {
  const { setUser } = useContext(AuthContext);
  const { userId: guestId, mergeCart } = useContext(CartContext);

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");
    try {
      const data = await AuthService.login(email, password);
      localStorage.setItem("token", data.access_token);
      setUser(data.user);

      if (mergeCart && guestId) {
        await mergeCart(guestId, data.user.id);
      }

      onClose(true);
    } catch {
      setErrorMessage("Invalid email or password.");
    }
  };

  const handleSignup = async () => {
    setErrorMessage("");
    try {
      const data = await AuthService.signup(name, email, password);
      localStorage.setItem("token", data.access_token);
      setUser(data.user);
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <h2 className={styles.title}>
          {mode === "login" ? "Sign In" : "Sign Up"}
        </h2>

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
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />

        {mode === "login" && (
          <div className={styles.loginOptions}>
            <label>
              <input type="checkbox" /> Stay signed in
            </label>
            <span className={styles.forgot}>Forgot your password?</span>
          </div>
        )}

        {mode === "signup" && (
          <label className={styles.terms}>
            <input type="checkbox" /> Yes, I agree with Privacy Policy and Terms
            of Use
          </label>
        )}

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

        <button
          className={styles.submitBtn}
          onClick={mode === "login" ? handleLogin : handleSignup}
        >
          {mode === "login" ? "LOG IN" : "SIGN UP"}
        </button>
      </div>
    </div>
  );
}
