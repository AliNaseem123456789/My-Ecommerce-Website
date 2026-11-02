import { Chip } from "@mui/material";

const ORDER_STATUS = {
  pending: { label: "Pending", color: "warning" },
  paid: { label: "Paid", color: "info" },
  shipped: { label: "Shipped", color: "primary" },
  delivered: { label: "Delivered", color: "success" },
  cancelled: { label: "Cancelled", color: "error" },
};

const PAYMENT_STATUS = {
  unpaid: { label: "Unpaid", color: "default" },
  paid: { label: "Paid", color: "success" },
  failed: { label: "Failed", color: "error" },
  refunded: { label: "Refunded", color: "warning" },
};

export default function StatusChip({ value, kind = "order", size = "small" }) {
  const map = kind === "payment" ? PAYMENT_STATUS : ORDER_STATUS;
  const entry = map[value] || { label: value || "unknown", color: "default" };
  return <Chip size={size} label={entry.label} color={entry.color} variant="outlined" />;
}
