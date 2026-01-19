import React from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";

export default function CheckoutPromo() {
  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Typography sx={{ fontWeight: 700 }}>Gift & Promo</Typography>
      <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
        Add a gift message or promo code
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder="Promo Code"
        sx={{ mb: 1 }}
      />
      <Button variant="outlined" fullWidth sx={{ textTransform: "none" }}>
        Apply
      </Button>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", gap: 1 }}>
        <PaymentIcon />
        <Box>
          <Typography sx={{ fontWeight: 700 }}>
            Store Credit Card Program
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Save when you use your store credit card*
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
