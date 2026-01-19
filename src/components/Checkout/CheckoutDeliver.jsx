import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Collapse,
  Paper,
} from "@mui/material";

export default function CheckoutDeliver({
  form,
  handleChange,
  completed,
  activeStep,
  saveDeliverContinue,
  reopenSection,
}) {
  return (
    <Paper elevation={1} sx={{ mb: 2, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          1. Deliver To
        </Typography>

        {completed.deliver ? (
          <Typography sx={{ color: "primary.main", fontWeight: 600 }}>
            Saved
          </Typography>
        ) : null}
      </Box>
      <Collapse in={!completed.deliver || activeStep === 0}>
        {!completed.deliver || activeStep === 0 ? (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Street Address"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Door Buzzer, Building Code, Apt#, etc"
                  name="apartment"
                  value={form.apartment}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="ZIP / Postal Code"
                  name="postal_code"
                  value={form.postal_code}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="State / Region"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                onClick={saveDeliverContinue}
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
      {completed.deliver && activeStep !== 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontWeight: 700 }}>
            {form.first_name} {form.last_name}
          </Typography>
          <Typography>{form.street}</Typography>
          <Typography>
            {form.city}, {form.state} {form.postal_code}
          </Typography>
          <Button
            variant="text"
            onClick={() => reopenSection(0)}
            sx={{ textTransform: "none", mt: 1 }}
          >
            Change
          </Button>
        </Box>
      )}
    </Paper>
  );
}
