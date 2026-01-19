import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { faqData } from "../../data/faqData";

export default function FAQ() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 900,
        mx: "auto",
        mt: { xs: 4, md: 8 },
        px: { xs: 2, md: 4 },
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "#2c7cf1",
          mb: 4,
          fontSize: { xs: "1.2rem", md: "1.6rem" },
        }}
      >
        FREQUENTLY ASKED QUESTIONS
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {faqData.map((item, index) => (
          <Accordion
            key={index}
            elevation={0}
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px !important",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 500 }}>{item.q}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{item.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
