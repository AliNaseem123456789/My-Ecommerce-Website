import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, MenuItem, TextField, Typography } from "@mui/material";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusChip from "../components/StatusChip";
import { adminService } from "../../services/admin.service";
import useAdminData from "../hooks/useAdminData";
import { money, shortId, dateTime } from "../format";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function OrdersList() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");

  const fetcher = useCallback(() => adminService.orders(status), [status]);
  const { data, loading, error, reload } = useAdminData(fetcher);
  const orders = data || [];

  const revenue = orders
    .filter((order) => order.payment_status === "paid")
    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

  const columns = [
    {
      key: "order_id",
      label: "Order",
      render: (row) => (
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, fontFamily: "monospace" }}>
            {shortId(row.order_id)}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {row.order_items?.length || 0} item
            {(row.order_items?.length || 0) === 1 ? "" : "s"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "created_at",
      label: "Placed",
      sortValue: (row) => new Date(row.created_at || 0).getTime(),
      render: (row) => (
        <Typography sx={{ fontSize: 13 }}>{dateTime(row.created_at)}</Typography>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      searchValue: (row) =>
        `${row.users_test?.name || ""} ${row.users_test?.email || ""}`,
      sortValue: (row) => row.users_test?.email || "",
      render: (row) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
            {row.users_test?.name || "Guest"}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {row.users_test?.email || "—"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      sortValue: (row) => Number(row.total ?? 0),
      render: (row) => (
        <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
          {money(row.total)}
        </Typography>
      ),
    },
    {
      key: "payment_status",
      label: "Payment",
      render: (row) => <StatusChip value={row.payment_status} kind="payment" />,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusChip value={row.status} />,
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} order${orders.length === 1 ? "" : "s"}${
          revenue ? ` · ${money(revenue)} collected` : ""
        }`}
      />

      <DataTable
        columns={columns}
        rows={orders}
        getRowId={(row) => row.order_id}
        loading={loading}
        error={error}
        onRetry={reload}
        searchPlaceholder="Search by order id, customer or email…"
        initialSort={{ key: "created_at", dir: "desc" }}
        emptyTitle={status ? `No ${status} orders` : "No orders yet"}
        emptyMessage="Orders appear here as soon as a payment succeeds."
        onRowClick={(row) => navigate(`/admin/orders/${row.order_id}`)}
        toolbar={
          <TextField
            select
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {STATUSES.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        }
      />
    </Box>
  );
}
