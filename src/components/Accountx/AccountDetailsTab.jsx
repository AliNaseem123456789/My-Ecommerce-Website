import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { AccountService } from "../../services/account.service";

export default function AccountDetailsTab() {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const saveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const updated = await AccountService.updateProfile({ name, email });
      setUser({ ...user, ...updated });
      setMessage("Account details saved.");
    } catch (err) {
      const text = err.response?.data?.message;
      setError(Array.isArray(text) ? text.join(", ") : text || "Could not save account details.");
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await AccountService.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated.");
    } catch (err) {
      const text = err.response?.data?.message;
      setError(Array.isArray(text) ? text.join(", ") : text || "Could not change password.");
    }
  };

  return (
    <div>
      <h2>Account Details</h2>
      <form onSubmit={saveProfile}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button type="submit">Save details</button>
      </form>
      <form onSubmit={savePassword}>
        <label>
          Current password
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>
        <label>
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <button type="submit">Change password</button>
      </form>
      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}
