import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Loading authentication...</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/required-login" replace />;
  }
  return children;
}
