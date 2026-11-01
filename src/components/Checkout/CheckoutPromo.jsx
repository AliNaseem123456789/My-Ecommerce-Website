import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";

export default function CheckoutPromo({
  applied,
  message,
  onApply,
  onRemove,
}) {
  const [code, setCode] = useState("");

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Typography sx={{ fontWeight: 700 }}>Gift & Promo</Typography>
      <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
        Add a gift message or promo code
      </Typography>

      {applied ? (
        <Box sx={{ mb: 1 }}>
          <Typography sx={{ fontWeight: 700 }}>
            {applied.code} · −${Number(applied.discount).toFixed(2)}
          </Typography>
          <Button
            variant="text"
            onClick={onRemove}
            sx={{ textTransform: "none", px: 0 }}
          >
            Remove
          </Button>
        </Box>
      ) : (
        <>
          <TextField
            fullWidth
            size="small"
            placeholder="Promo Code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            sx={{ mb: 1 }}
          />
          <Button
            variant="outlined"
            fullWidth
            sx={{ textTransform: "none" }}
            onClick={() => onApply(code)}
          >
            Apply
          </Button>
        </>
      )}
      {message ? (
        <Typography sx={{ fontSize: 13, mt: 1 }}>{message}</Typography>
      ) : null}

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
