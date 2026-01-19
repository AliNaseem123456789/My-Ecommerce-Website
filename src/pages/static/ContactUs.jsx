import { TextField, Typography, Box, Button } from "@mui/material";

export default function ContactUs() {
  return (
    <Box
      sx={{
        width: "100%",
        mt: 6,
        px: { xs: 2, md: 6 },
        maxWidth: 900,
        mx: "auto",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "#2c7cf1",
          mb: 3,
          fontSize: { xs: "1.2rem", md: "1.6rem" },
        }}
      >
        Contact Us
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Your Name"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            size="small"
            label="Your Email"
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Phone Number"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            size="small"
            label="Company"
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <TextField
          fullWidth
          size="small"
          multiline
          rows={5}
          label="Your Message"
          InputLabelProps={{ shrink: true }}
        />

        <Button
          variant="contained"
          sx={{
            backgroundColor: "#111",
            textTransform: "none",
            px: 4,
            py: 1.5,
            borderRadius: "6px",
            "&:hover": { backgroundColor: "#222" },
          }}
        >
          Send Message
        </Button>
      </Box>
    </Box>
  );
}
