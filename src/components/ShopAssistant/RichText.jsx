import React from "react";
import { Box, Typography } from "@mui/material";

// Tiny, safe formatter for bot replies: **bold**, "- " bullets, numbered
// lines and paragraphs. Builds React nodes (no innerHTML), so model output
// can never inject markup.
function inline(text, keyBase) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${keyBase}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={`${keyBase}-${i}`}>{part}</React.Fragment>
    ),
  );
}

export default function RichText({ text, color }) {
  const lines = String(text || "").split(/\r?\n/);
  const blocks = [];
  let list = null;

  const flush = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  lines.forEach((line, idx) => {
    const bullet = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      if (!list) list = { type: "list", items: [] };
      list.items.push(bullet[1]);
      return;
    }
    flush();
    if (line.trim()) blocks.push({ type: "p", text: line, idx });
  });
  flush();

  return (
    <Box sx={{ color, "& p": { m: 0 }, display: "flex", flexDirection: "column", gap: 0.75 }}>
      {blocks.map((b, i) =>
        b.type === "list" ? (
          <Box component="ul" key={i} sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 0.4 }}>
            {b.items.map((item, j) => (
              <Typography component="li" variant="body2" key={j} sx={{ lineHeight: 1.5 }}>
                {inline(item, `${i}-${j}`)}
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" key={i} sx={{ lineHeight: 1.55, wordBreak: "break-word" }}>
            {inline(b.text, i)}
          </Typography>
        ),
      )}
    </Box>
  );
}
