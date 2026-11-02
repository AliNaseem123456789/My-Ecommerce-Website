import { createTheme } from "@mui/material/styles";

// Admin-only theme. Denser than the storefront, neutral palette, flat surfaces.
const adminTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563eb" },
    success: { main: "#16a34a" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
    info: { main: "#0891b2" },
    background: { default: "#f6f7f9", paper: "#ffffff" },
    text: { primary: "#111827", secondary: "#6b7280" },
    divider: "#e5e7eb",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h5: { fontWeight: 650, letterSpacing: "-0.01em" },
    h6: { fontWeight: 650 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: "1px solid #e5e7eb", backgroundImage: "none" },
      },
    },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiSelect: { defaultProps: { size: "small" } },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 650,
          fontSize: 13,
          color: "#374151",
          backgroundColor: "#f9fafb",
          whiteSpace: "nowrap",
        },
        root: { borderColor: "#eef0f3" },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});

export default adminTheme;
