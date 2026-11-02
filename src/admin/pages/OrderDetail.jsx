import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PageHeader from "../components/PageHeader";
import StatusChip from "../components/StatusChip";
import ConfirmDialog from "../components/ConfirmDialog";
import { adminService } from "../../services/admin.service";
import { money, dateTime, ORDER_FLOW } from "../format";

const TIMELINE = ["pending", "paid", "shipped", "delivered"];

function Row({ label, value, strong }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.6 }}>
      <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontSize: 13.5, fontWeight: strong ? 700 : 500 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");

  const applyOrder = (row) => {
    setOrder(row);
    setCarrier(row?.carrier || "");
    setTracking(row?.tracking_number || "");
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      let row = null;
      try {
        row = await adminService.order(id);
      } catch {
        const all = await adminService.orders();
        row = (all || []).find((item) => String(item.order_id) === String(id));
      }
      if (!row) {
        setLoadError("That order could not be found.");
        return;
      }
      applyOrder(row);
    } catch (err) {
      setLoadError(err?.response?.data?.message || "Could not load this order.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async () => {
    setBusy(true);
    setActionError("");
    try {
      await adminService.updateOrderStatus(id, pendingStatus, {
        carrier: carrier || undefined,
        tracking_number: tracking || undefined,
      });
      setPendingStatus("");
      setToast("Status updated");
      await load();
    } catch (err) {
      setActionError(
        err?.response?.data?.message || "That status change was rejected.",
      );
    } finally {
      setBusy(false);
    }
  };

  const saveTracking = async () => {
    setBusy(true);
    setActionError("");
    try {
      await adminService.updateTracking(id, {
        carrier: carrier || undefined,
        tracking_number: tracking || undefined,
      });
      setToast("Tracking saved");
      await load();
    } catch (err) {
      setActionError(
        err?.response?.data?.message || "Tracking could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box>
        <PageHeader title="Order" />
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={load}>
              Retry
            </Button>
          }
        >
          {loadError}
        </Alert>
      </Box>
    );
  }

  const items = order.order_items || [];
  const address = Array.isArray(order.shipping_address)
    ? order.shipping_address[0]
    : order.shipping_address;
  const nextStatuses = ORDER_FLOW[order.status] || [];
  const activeStep = order.status === "cancelled" ? -1 : TIMELINE.indexOf(order.status);

  const stampFor = (status) =>
    ({
      pending: order.created_at,
      paid: order.paid_at,
      shipped: order.shipped_at,
      delivered: order.delivered_at,
    })[status];

  return (
    <Box>
      <PageHeader
        title="Order"
        subtitle={
          <Box component="span" sx={{ fontFamily: "monospace" }}>{order.order_id}</Box>
        }
        actions={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/orders")}>
            Back
          </Button>
        }
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      <Paper sx={{ p: 2.5, mb: 2.5 }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2.5, flexWrap: "wrap" }}>
          <StatusChip value={order.status} />
          <StatusChip value={order.payment_status} kind="payment" />
          <Box sx={{ flex: 1 }} />
          {nextStatuses.map((option) => (
            <Button
              key={option}
              size="small"
              variant={option === "cancelled" ? "outlined" : "contained"}
              color={option === "cancelled" ? "error" : "primary"}
              disabled={busy}
              onClick={() => setPendingStatus(option)}
            >
              Mark {option}
            </Button>
          ))}
        </Box>

        {order.status === "cancelled" ? (
          <Alert severity="error" variant="outlined">
            Cancelled {order.cancelled_at ? `on ${dateTime(order.cancelled_at)}` : ""}
          </Alert>
        ) : (
          <Stepper activeStep={activeStep} alternativeLabel>
            {TIMELINE.map((status) => (
              <Step key={status} completed={TIMELINE.indexOf(status) <= activeStep}>
                <StepLabel
                  optional={
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      {stampFor(status) ? dateTime(stampFor(status)) : "—"}
                    </Typography>
                  }
                >
                  {status}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 340px" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <Paper sx={{ overflow: "hidden" }}>
          <Typography variant="subtitle2" sx={{ p: 2 }}>
            Items
          </Typography>
          <Divider />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Unit</TableCell>
                <TableCell align="right">Line</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.item_id}>
                  <TableCell>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                      {item.product_name || item.products?.name || `Product #${item.product_id}`}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      #{item.product_id}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{money(item.price)}</TableCell>
                  <TableCell align="right">
                    {money(Number(item.price ?? 0) * Number(item.quantity ?? 0))}
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
                      No line items recorded for this order.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        <Box sx={{ display: "grid", gap: 2.5 }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Totals
            </Typography>
            <Row label="Subtotal" value={money(order.subtotal)} />
            {Number(order.discount ?? 0) > 0 && (
              <Row label={`Discount ${order.coupon_code || ""}`} value={`-${money(order.discount)}`} />
            )}
            <Row label="Shipping" value={money(order.shipping)} />
            <Row label="Tax" value={money(order.tax)} />
            <Divider sx={{ my: 1 }} />
            <Row label="Total" value={money(order.total)} strong />
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Customer
            </Typography>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
              {order.users_test?.name || "Guest"}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              {order.users_test?.email || "—"}
            </Typography>

            {address && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
                  Ship to
                </Typography>
                <Typography sx={{ fontSize: 13, lineHeight: 1.7 }}>
                  {[address.first_name, address.last_name].filter(Boolean).join(" ")}
                  <br />
                  {address.street}
                  {address.apartment ? `, ${address.apartment}` : ""}
                  <br />
                  {[address.city, address.state, address.postal_code]
                    .filter(Boolean)
                    .join(", ")}
                  {address.phone && (
                    <>
                      <br />
                      {address.phone}
                    </>
                  )}
                </Typography>
              </>
            )}
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Shipment
            </Typography>
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <TextField
                label="Carrier"
                value={carrier}
                onChange={(event) => setCarrier(event.target.value)}
                fullWidth
              />
              <TextField
                label="Tracking number"
                value={tracking}
                onChange={(event) => setTracking(event.target.value)}
                fullWidth
              />
              <Button variant="outlined" onClick={saveTracking} disabled={busy}>
                Save tracking
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Payment
            </Typography>
            <Row label="Method" value={order.payment_method || "—"} />
            <Row label="Status" value={order.payment_status || "—"} />
            <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: 1, wordBreak: "break-all" }}>
              {order.payment_intent_id || "No payment intent recorded"}
            </Typography>
          </Paper>
        </Box>
      </Box>

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title={`Mark order as ${pendingStatus}?`}
        message={
          pendingStatus === "cancelled"
            ? "Cancelling a paid order should restore stock. Confirm only if that is what you want."
            : `The customer may be notified that this order is ${pendingStatus}.`
        }
        confirmLabel={`Mark ${pendingStatus}`}
        destructive={pendingStatus === "cancelled"}
        busy={busy}
        onConfirm={changeStatus}
        onClose={() => setPendingStatus("")}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2500}
        onClose={() => setToast("")}
        message={toast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
