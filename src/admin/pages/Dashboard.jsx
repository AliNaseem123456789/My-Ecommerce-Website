import { useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusChip from "../components/StatusChip";
import { adminService } from "../../services/admin.service";
import useAdminData from "../hooks/useAdminData";
import { money, shortId, shortDate } from "../format";

const DAYS = 14;

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

function buildSeries(orders) {
  const buckets = new Map();
  for (let offset = DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    buckets.set(dayKey(date), { date, count: 0, revenue: 0 });
  }
  orders.forEach((order) => {
    if (!order.created_at) return;
    const key = dayKey(new Date(order.created_at));
    const bucket = buckets.get(key);
    if (!bucket) return;
    bucket.count += 1;
    if (order.payment_status === "paid") {
      bucket.revenue += Number(order.total ?? 0);
    }
  });
  return Array.from(buckets.values());
}

function MiniChart({ series }) {
  const max = Math.max(1, ...series.map((point) => point.count));
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.75, height: 132, mt: 2 }}>
      {series.map((point) => (
        <Tooltip
          key={point.date.toISOString()}
          title={`${shortDate(point.date)} — ${point.count} order${
            point.count === 1 ? "" : "s"
          }, ${money(point.revenue)}`}
        >
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
            <Box
              sx={{
                width: "100%",
                height: `${Math.max(4, (point.count / max) * 108)}px`,
                borderRadius: 1,
                bgcolor: point.count ? "primary.main" : "#e5e7eb",
                transition: "height .2s ease",
              }}
            />
            <Typography sx={{ fontSize: 10, color: "text.secondary" }}>
              {point.date.getDate()}
            </Typography>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
}

export default function Dashboard() {
  const fetcher = useCallback(
    () =>
      Promise.all([
        adminService.summary(),
        adminService.orders(),
        adminService.products(),
      ]),
    [],
  );
  const { data, loading, error, reload } = useAdminData(fetcher);

  const summary = data?.[0] || null;
  const orders = data?.[1] || [];
  const products = data?.[2] || [];

  const revenue = orders
    .filter((order) => order.payment_status === "paid")
    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

  const statusCount = (status) =>
    (summary?.byStatus || []).find((row) => row.status === status)?.count ?? 0;

  const outOfStock = products.filter((item) => Number(item.stock ?? 0) === 0);
  const lowStock = products
    .filter((item) => {
      const stock = Number(item.stock ?? 0);
      return stock > 0 && stock <= 5;
    })
    .sort((a, b) => Number(a.stock ?? 0) - Number(b.stock ?? 0));
  const missingImages = products.filter((item) => !item.image_url);

  const recent = [...orders]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 6);

  const series = buildSeries(orders);

  return (
    <Box>
      <PageHeader
        title="Overview"
        subtitle="Store activity at a glance"
        actions={
          <Button onClick={reload} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2.5 }}
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && !error && missingImages.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2.5 }}>
          {missingImages.length} of {products.length} products have no image and show a
          placeholder in the store.{" "}
          <RouterLink to="/admin/products">Review products</RouterLink>
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "repeat(3, 1fr)",
            xl: "repeat(6, 1fr)",
          },
          gap: 2,
          mb: 2.5,
        }}
      >
        <StatCard
          label="Revenue collected"
          value={money(revenue)}
          icon={PaidOutlinedIcon}
          tone="success"
          loading={loading}
        />
        <StatCard
          label="Orders"
          value={summary?.orders ?? orders.length}
          icon={ReceiptLongOutlinedIcon}
          tone="info"
          loading={loading}
        />
        <StatCard
          label="Awaiting payment"
          value={statusCount("pending")}
          icon={PendingActionsOutlinedIcon}
          tone="warning"
          loading={loading}
        />
        <StatCard
          label="Products"
          value={summary?.products ?? products.length}
          icon={Inventory2OutlinedIcon}
          loading={loading}
        />
        <StatCard
          label="Customers"
          value={summary?.customers ?? 0}
          icon={PeopleAltOutlinedIcon}
          loading={loading}
        />
        <StatCard
          label="Out of stock"
          value={outOfStock.length}
          icon={WarningAmberOutlinedIcon}
          tone={outOfStock.length ? "error" : "default"}
          loading={loading}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <Box sx={{ display: "grid", gap: 2.5 }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle2">Orders, last {DAYS} days</Typography>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
              {series.reduce((sum, point) => sum + point.count, 0)} orders ·{" "}
              {money(series.reduce((sum, point) => sum + point.revenue, 0))} collected
            </Typography>
            <MiniChart series={series} />
          </Paper>

          <Paper sx={{ overflow: "hidden" }}>
            <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                Recent orders
              </Typography>
              <Button size="small" component={RouterLink} to="/admin/orders">
                View all
              </Button>
            </Box>
            <Divider />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recent.map((order) => (
                  <TableRow
                    key={order.order_id}
                    hover
                    component={RouterLink}
                    to={`/admin/orders/${order.order_id}`}
                    sx={{ textDecoration: "none", cursor: "pointer", display: "table-row" }}
                  >
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12.5 }}>
                      {shortId(order.order_id)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>
                      {order.users_test?.name || order.users_test?.email || "Guest"}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600 }}>
                      {money(order.total)}
                    </TableCell>
                    <TableCell>
                      <StatusChip value={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && recent.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography
                        sx={{ py: 3, textAlign: "center", color: "text.secondary" }}
                      >
                        No orders yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Box>

        <Box sx={{ display: "grid", gap: 2.5 }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Needs restocking
            </Typography>
            {outOfStock.length === 0 && lowStock.length === 0 && (
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Every product has healthy stock.
              </Typography>
            )}
            {[...outOfStock, ...lowStock].slice(0, 8).map((item) => (
              <Box
                key={item.product_id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.75,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <Typography sx={{ fontSize: 13, flex: 1, minWidth: 0 }} noWrap>
                  {item.name}
                </Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  color={Number(item.stock ?? 0) === 0 ? "error" : "warning"}
                  label={Number(item.stock ?? 0) === 0 ? "Out" : item.stock}
                />
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Orders by status
            </Typography>
            {(summary?.byStatus || []).map((row) => (
              <Box
                key={row.status || "unknown"}
                sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.6 }}
              >
                <StatusChip value={row.status} />
                <Box sx={{ flex: 1 }} />
                <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                  {row.count}
                </Typography>
              </Box>
            ))}
            {!loading && (summary?.byStatus || []).length === 0 && (
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                No orders to summarise.
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
