import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthService } from "../services/auth.service";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get("token") || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await AuthService.resetPassword(token, password);
      setMessage("Password updated. You can sign in now.");
      setTimeout(() => navigate("/login-required"), 800);
    } catch (err) {
      const text = err.response?.data?.message;
      setError(Array.isArray(text) ? text.join(", ") : text || "Reset failed.");
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1>Reset password</h1>
      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Reset token"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        required
      />
      <button type="submit">Update password</button>
      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </form>
  );
}
