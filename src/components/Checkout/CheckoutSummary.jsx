import React from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";

export default function CheckoutSummary({
  cartItems,
  subtotal,
  shippingMethod,
  loading,
  placeOrder,
}) {
  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Typography sx={{ fontWeight: 700, mb: 1 }}>Order Summary</Typography>
      <Divider sx={{ mb: 2 }} />

      <List dense>
        {cartItems.map((item) => (
          <ListItem key={item.cart_item_id}>
            <ListItemAvatar>
              <Avatar
                variant="square"
                src={item.image}
                sx={{ width: 56, height: 56, borderRadius: 1 }}
              />
            </ListItemAvatar>

            <ListItemText
              primary={
                <Typography sx={{ fontWeight: 600 }}>
                  {item.products.name}
                </Typography>
              }
              secondary={`${item.quantity} × $${item.products.price.toFixed(2)}`}
              sx={{ ml: 1 }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography>Subtotal</Typography>
        <Typography sx={{ fontWeight: 700 }}>${subtotal.toFixed(2)}</Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography>Shipping</Typography>
        <Typography sx={{ fontWeight: 700 }}>
          ${shippingMethod.price.toFixed(2)}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography sx={{ fontWeight: 800 }}>Estimated Total</Typography>
        <Typography sx={{ fontWeight: 800 }}>
          ${(subtotal + shippingMethod.price).toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  );
}
