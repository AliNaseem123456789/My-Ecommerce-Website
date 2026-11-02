import { Box, Paper, Skeleton, Typography } from "@mui/material";

export default function StatCard({ label, value, hint, icon: Icon, tone = "default", loading }) {
  const tones = {
    default: { bg: "#eef2ff", fg: "#4338ca" },
    success: { bg: "#ecfdf5", fg: "#047857" },
    warning: { bg: "#fffbeb", fg: "#b45309" },
    error: { bg: "#fef2f2", fg: "#b91c1c" },
    info: { bg: "#ecfeff", fg: "#0e7490" },
  };
  const palette = tones[tone] || tones.default;

  return (
    <Paper sx={{ p: 2.25, display: "flex", gap: 1.75, alignItems: "flex-start" }}>
      {Icon && (
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 2,
            bgcolor: palette.bg,
            color: palette.fg,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon fontSize="small" />
        </Box>
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 12.5, color: "text.secondary", fontWeight: 600 }}>
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={72} height={32} />
        ) : (
          <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25 }}>
            {value}
          </Typography>
        )}
        {hint && (
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{hint}</Typography>
        )}
      </Box>
    </Paper>
  );
}
