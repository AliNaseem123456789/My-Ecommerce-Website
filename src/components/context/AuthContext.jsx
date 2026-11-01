import React, { createContext, useState, useEffect } from "react";
import apiClient from "../../api/apiClient";
import { AuthService } from "../../services/auth.service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      console.log("Token exists:", !!token);

      if (token) {
        try {
          const response = await apiClient.get("/auth/me");
          console.log("Auth response:", response);

          // ✅ Extract user from response (matches backend structure)
          const userData = response.user || response;
          console.log("User data:", userData);

          setUser(userData);
        } catch (error) {
          console.error("Auth failed:", error);
          // If token is invalid, clear it
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
