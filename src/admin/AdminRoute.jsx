import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { AuthContext } from "../components/context/AuthContext";

/**
 * Gate for the whole /admin subtree.
 * Checks the role here, at the route boundary, instead of inside each page.
 */
export default function AdminRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "#f6f7f9",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login-required" replace />;

  if (user.role !== "admin") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "#f6f7f9",
          p: 3,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 420, textAlign: "center" }}>
          <LockOutlinedIcon sx={{ fontSize: 40, color: "text.secondary" }} />
          <Typography variant="h6" mt={1}>
            Admin access only
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            This account does not have administrator permissions.
          </Typography>
          <Button href="/" variant="contained" sx={{ mt: 3 }}>
            Back to store
          </Button>
        </Paper>
      </Box>
    );
  }

  return children;
}
