import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { productImageFrom } from "../../utils/productImage";

const money = (v) =>
  v == null || Number.isNaN(Number(v)) ? "—" : `$${Number(v).toFixed(2)}`;

const cardSx = {
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2.5,
  overflow: "hidden",
};

export function ProductCards({ products, onAsk, onOpen, accent }) {
  if (!products?.length) return null;
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.25,
        overflowX: "auto",
        pb: 0.5,
        scrollSnapType: "x mandatory",
        "&::-webkit-scrollbar": { height: 6 },
        "&::-webkit-scrollbar-thumb": { bgcolor: "grey.300", borderRadius: 3 },
      }}
    >
      {products.map((p) => (
        <Box key={p.id} sx={{ ...cardSx, minWidth: 176, maxWidth: 176, scrollSnapAlign: "start", display: "flex", flexDirection: "column" }}>
          <Box
            component="button"
            onClick={() => onOpen(p)}
            aria-label={`Open ${p.name}`}
            sx={{ p: 0, border: 0, bgcolor: "grey.50", cursor: "pointer", aspectRatio: "4 / 3", display: "block" }}
          >
            <Box
              component="img"
              src={productImageFrom(p.image)}
              alt={p.name}
              loading="lazy"
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </Box>
          <Box sx={{ p: 1.25, display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              onClick={() => onOpen(p)}
              sx={{ cursor: "pointer", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.6em" }}
            >
              {p.name}
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" fontWeight={700}>
                {money(p.price)}
              </Typography>
              {p.rating ? (
                <Stack direction="row" alignItems="center" sx={{ color: "text.secondary" }}>
                  <StarRoundedIcon sx={{ fontSize: 16, color: "#f5a524" }} />
                  <Typography variant="caption">{Number(p.rating).toFixed(1)}</Typography>
                </Stack>
              ) : null}
            </Stack>
            <Typography variant="caption" sx={{ color: p.in_stock ? "success.main" : "error.main" }}>
              {p.in_stock ? (p.stock && p.stock <= 5 ? `Only ${p.stock} left` : "In stock") : "Out of stock"}
            </Typography>
            <Button
              size="small"
              variant="contained"
              disableElevation
              startIcon={<AddShoppingCartIcon sx={{ fontSize: 16 }} />}
              disabled={!p.in_stock}
              onClick={() => onAsk(`Add ${p.name} (product #${p.id}) to my cart`)}
              sx={{ mt: "auto", textTransform: "none", borderRadius: 2, bgcolor: accent, "&:hover": { bgcolor: accent, filter: "brightness(0.92)" } }}
            >
              Add to cart
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export function CartCard({ cart, onCheckout, accent }) {
  if (!cart) return null;
  return (
    <Box sx={{ ...cardSx, p: 1.5 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Your cart · {cart.item_count} item{cart.item_count === 1 ? "" : "s"}
      </Typography>
      {cart.items?.length ? (
        <Stack spacing={1}>
          {cart.items.slice(0, 5).map((line) => (
            <Stack key={line.cart_item_id} direction="row" spacing={1} alignItems="center">
              <Box component="img" src={productImageFrom(line.product?.image)} alt="" sx={{ width: 40, height: 40, borderRadius: 1.5, objectFit: "cover", bgcolor: "grey.100" }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap>{line.product?.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {line.quantity} × {money(line.product?.price)}
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={600}>{money(line.line_total)}</Typography>
            </Stack>
          ))}
          {cart.items.length > 5 && (
            <Typography variant="caption" color="text.secondary">+ {cart.items.length - 5} more</Typography>
          )}
          <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: "1px dashed", borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2" fontWeight={700}>{money(cart.subtotal)}</Typography>
          </Stack>
          <Button size="small" variant="outlined" onClick={onCheckout} sx={{ textTransform: "none", borderRadius: 2, borderColor: accent, color: accent }}>
            Check out with the assistant
          </Button>
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">Your cart is empty.</Typography>
      )}
    </Box>
  );
}

const STATUS_COLORS = {
  pending: "warning",
  paid: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "default",
};

function OrderRow({ order, onAsk }) {
  const id = String(order.order_id || "");
  return (
    <Box sx={{ ...cardSx, p: 1.25 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" fontWeight={700}>Order #{id.slice(0, 8)}</Typography>
        <Chip size="small" label={order.status || "pending"} color={STATUS_COLORS[order.status] || "default"} sx={{ textTransform: "capitalize", height: 22 }} />
      </Stack>
      {order.total != null && (
        <Typography variant="caption" color="text.secondary">
          {money(order.total)}
          {order.created_at ? ` · ${new Date(order.created_at).toLocaleDateString()}` : ""}
        </Typography>
      )}
      {order.tracking_number && (
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5 }}>
          <LocalShippingOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="caption">
            {order.carrier ? `${order.carrier}: ` : ""}
            {order.tracking_number}
          </Typography>
        </Stack>
      )}
      {onAsk && (
        <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
          <Chip size="small" variant="outlined" label="Details" onClick={() => onAsk(`Show details for order ${id}`)} />
          {["pending", "paid"].includes(order.status) && (
            <Chip size="small" variant="outlined" label="Cancel" onClick={() => onAsk(`I want to cancel order ${id}`)} />
          )}
          {order.status === "delivered" && (
            <Chip size="small" variant="outlined" label="Return" onClick={() => onAsk(`I want to return items from order ${id}`)} />
          )}
        </Stack>
      )}
    </Box>
  );
}

export function OrderCards({ orders, onAsk }) {
  if (!orders?.length) return null;
  return (
    <Stack spacing={1}>
      {orders.slice(0, 4).map((o) => (
        <OrderRow key={o.order_id} order={o} onAsk={onAsk} />
      ))}
    </Stack>
  );
}

export function CheckoutCard({ data, onContinue, accent }) {
  const s = data?.summary || {};
  return (
    <Box sx={{ ...cardSx, p: 1.5, borderColor: accent }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <CheckCircleOutlineIcon sx={{ color: "success.main", fontSize: 20 }} />
        <Typography variant="subtitle2" fontWeight={700}>Ready for checkout</Typography>
      </Stack>
      <Stack spacing={0.5} sx={{ mb: 1.25 }}>
        <Row label={`Items (${s.items ?? "—"})`} value={money(s.subtotal)} />
        <Row label="Shipping" value={s.shipping ? money(s.shipping) : "Free"} />
        {s.discount ? <Row label="Discount" value={`−${money(s.discount)}`} /> : null}
        <Row label={<strong>Estimated total</strong>} value={<strong>{money(s.estimated_total)}</strong>} />
      </Stack>
      <Button
        fullWidth
        variant="contained"
        disableElevation
        startIcon={<LockOutlinedIcon />}
        onClick={() => onContinue(data)}
        sx={{ textTransform: "none", borderRadius: 2, py: 1, bgcolor: accent, "&:hover": { bgcolor: accent, filter: "brightness(0.92)" } }}
      >
        Continue to secure checkout
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75, textAlign: "center" }}>
        You'll review everything and pay on the checkout page.
      </Typography>
    </Box>
  );
}

function Row({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}

export function Choices({ options, onPick, disabled }) {
  if (!options?.length) return null;
  return (
    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75}>
      {options.map((opt) => (
        <Chip key={opt} label={opt} variant="outlined" disabled={disabled} onClick={() => onPick(opt)} sx={{ borderRadius: 2, height: "auto", py: 0.5, "& .MuiChip-label": { whiteSpace: "normal" } }} />
      ))}
    </Stack>
  );
}

export function ConfirmCard({ action, onAnswer, busy, accent }) {
  const actions = action?.actions || [];
  return (
    <Box sx={{ ...cardSx, p: 1.5, bgcolor: "#fffbeb", borderColor: "#fcd34d" }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>
        Please confirm
      </Typography>
      <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.25, mb: 1.25 }}>
        {actions.map((a, i) => (
          <Typography component="li" variant="body2" key={i}>{a.summary}</Typography>
        ))}
      </Stack>
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="contained"
          disableElevation
          disabled={busy}
          onClick={() => onAnswer(true)}
          sx={{ textTransform: "none", borderRadius: 2, flex: 1, bgcolor: accent, "&:hover": { bgcolor: accent, filter: "brightness(0.92)" } }}
        >
          Yes, do it
        </Button>
        <Button size="small" variant="outlined" color="inherit" disabled={busy} onClick={() => onAnswer(false)} sx={{ textTransform: "none", borderRadius: 2, flex: 1 }}>
          No, cancel
        </Button>
      </Stack>
    </Box>
  );
}
