import React from "react";
import {
  Box,
  Typography,
  Collapse,
  Paper,
  Button,
  TextField,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  InputAdornment,
} from "@mui/material";
import AddCardIcon from "@mui/icons-material/CreditCard";

export default function CheckoutPayment({
  paymentMethod,
  setPaymentMethod,
  card,
  setCard,
  completed,
  activeStep,
  savePayment,
  reopenSection,
  logos,
}) {
  return (
    <Paper elevation={1} sx={{ mb: 2, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          2. Payment
        </Typography>
      </Box>

      <Collapse in={!completed.payment || activeStep === 2}>
        {!completed.payment || activeStep === 2 ? (
          <Box sx={{ mt: 2 }}>
            <FormControl>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="paypal"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <img
                        src={logos.paypal}
                        alt="paypal"
                        style={{ height: 22 }}
                      />
                      Pay with PayPal
                    </Box>
                  }
                />

                <FormControlLabel
                  value="venmo"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <img
                        src={logos.venmo}
                        alt="venmo"
                        style={{ height: 22 }}
                      />
                      Pay with Venmo
                    </Box>
                  }
                />

                <FormControlLabel
                  value="klarna"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <img
                        src={logos.klarna}
                        alt="klarna"
                        style={{ height: 22 }}
                      />
                      Klarna
                    </Box>
                  }
                />

                <FormControlLabel
                  value="afterpay"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <img
                        src={logos.afterpay}
                        alt="afterpay"
                        style={{ height: 22 }}
                      />
                      Afterpay
                    </Box>
                  }
                />

                <FormControlLabel
                  value="card"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <AddCardIcon /> Credit / Debit Card
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            {paymentMethod === "card" && (
              <Paper sx={{ p: 2, mt: 2 }} variant="outlined">
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Name on Card"
                      value={card.name_on_card}
                      onChange={(e) =>
                        setCard({ ...card, name_on_card: e.target.value })
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Card Number"
                      value={card.number}
                      onChange={(e) =>
                        setCard({ ...card, number: e.target.value })
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">****</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Expiry MM/YY"
                      value={card.expiry}
                      onChange={(e) =>
                        setCard({ ...card, expiry: e.target.value })
                      }
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="CVC"
                      value={card.cvc}
                      onChange={(e) =>
                        setCard({ ...card, cvc: e.target.value })
                      }
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                onClick={savePayment}
                sx={{
                  textTransform: "none",
                  bgcolor: "black",
                  ":hover": { bgcolor: "#111" },
                }}
              >
                Save & Continue
              </Button>
            </Box>
          </Box>
        ) : null}
      </Collapse>

      {completed.payment && activeStep !== 2 && (
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontWeight: 700 }}>
            {paymentMethod.toUpperCase()}
          </Typography>

          <Button
            variant="text"
            onClick={() => reopenSection(2)}
            sx={{ textTransform: "none" }}
          >
            Change
          </Button>
        </Box>
      )}
    </Paper>
  );
}
