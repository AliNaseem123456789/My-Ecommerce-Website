import React from "react";
import { Box, Typography, Collapse, Paper, Button, Grid } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

export default function CheckoutShipping({
  shippingMethod,
  completed,
  activeStep,
  saveShippingContinue,
  reopenSection,
  cartItems,
}) {
  return (
    <Paper elevation={1} sx={{ mb: 2, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          2. Shipping Method
        </Typography>

        {completed.shipping ? (
          <Typography sx={{ color: "primary.main", fontWeight: 600 }}>
            Saved
          </Typography>
        ) : null}
      </Box>

      <Collapse in={!completed.shipping || activeStep === 1}>
        {!completed.shipping || activeStep === 1 ? (
          <Box sx={{ mt: 2 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <LocalShippingIcon />
                </Grid>

                <Grid item xs>
                  <Typography sx={{ fontWeight: 700 }}>
                    {shippingMethod.title} • ${shippingMethod.price.toFixed(2)}
                  </Typography>

                  <Typography sx={{ color: "green", fontSize: 13 }}>
                    {shippingMethod.eta}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={saveShippingContinue}
                  sx={{
                    textTransform: "none",
                    bgcolor: "black",
                    ":hover": { bgcolor: "#111" },
                  }}
                >
                  Continue
                </Button>
              </Box>
            </Paper>
          </Box>
        ) : null}
      </Collapse>

      {completed.shipping && activeStep !== 1 && (
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontWeight: 700 }}>
            {shippingMethod.title}
          </Typography>
          <Typography sx={{ color: "green", fontSize: 13 }}>
            {shippingMethod.eta}
          </Typography>

          <Button
            variant="text"
            onClick={() => reopenSection(1)}
            sx={{ textTransform: "none", mt: 1 }}
          >
            Change
          </Button>
        </Box>
      )}
    </Paper>
  );
}
