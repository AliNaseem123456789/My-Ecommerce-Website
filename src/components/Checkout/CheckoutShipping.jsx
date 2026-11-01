import React, { useState } from "react";
import {
  Box,
  Typography,
  Collapse,
  Paper,
  Button,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

export default function CheckoutShipping({
  options,
  shippingMethod,
  setShippingMethod,
  completed,
  activeStep,
  saveShippingContinue,
  reopenSection,
}) {
  const shippingOptions = options || [];
  const [picked, setPicked] = useState(null);
  const selectedMethod =
    picked || shippingMethod?.code || shippingOptions[0]?.code || "";

  const handleContinue = () => {
    const selected = shippingOptions.find((opt) => opt.code === selectedMethod);
    if (selected && setShippingMethod) {
      setShippingMethod(selected);
    }
    saveShippingContinue();
  };
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
            <FormControl component="fieldset" sx={{ width: "100%" }}>
              <RadioGroup
                value={selectedMethod}
                onChange={(e) => setPicked(e.target.value)}
              >
                {shippingOptions.map((option) => (
                  <Paper
                    key={option.code}
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 2,
                      borderColor:
                        selectedMethod === option.code ? "#e60023" : "#e0e0e0",
                      bgcolor:
                        selectedMethod === option.code ? "#fff5f5" : "white",
                    }}
                  >
                    <FormControlLabel
                      value={option.code}
                      control={<Radio />}
                      label={
                        <Box sx={{ width: "100%" }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item>
                              <LocalShippingIcon sx={{ color: "#e60023" }} />
                            </Grid>
                            <Grid item xs>
                              <Typography sx={{ fontWeight: 700 }}>
                                {option.title}
                              </Typography>
                              <Typography sx={{ color: "#666", fontSize: 12 }}>
                                {option.min_days === option.max_days
                                  ? `${option.min_days} day`
                                  : `${option.min_days}–${option.max_days} days`}
                              </Typography>
                              <Typography
                                sx={{ color: "green", fontSize: 13, mt: 0.5 }}
                              >
                                {option.eta}
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Typography
                                sx={{ fontWeight: "bold", fontSize: 18 }}
                              >
                                ${option.price.toFixed(2)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      }
                      sx={{ width: "100%", m: 0 }}
                    />
                  </Paper>
                ))}
              </RadioGroup>
            </FormControl>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleContinue}
                sx={{
                  textTransform: "none",
                  bgcolor: "black",
                  ":hover": { bgcolor: "#111" },
                }}
              >
                Continue to Payment
              </Button>
            </Box>
          </Box>
        ) : null}
      </Collapse>

      {completed.shipping && activeStep !== 1 && (
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Typography sx={{ fontWeight: 700 }}>
                {shippingMethod?.title}
              </Typography>
              <Typography sx={{ color: "green", fontSize: 13 }}>
                {shippingMethod?.eta}
              </Typography>
            </div>
            <Typography sx={{ fontWeight: "bold" }}>
              ${Number(shippingMethod?.price || 0).toFixed(2)}
            </Typography>
          </Box>

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
