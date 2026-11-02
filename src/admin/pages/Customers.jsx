import { useCallback } from "react";
import { Box, Chip, Typography } from "@mui/material";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import { adminService } from "../../services/admin.service";
import useAdminData from "../hooks/useAdminData";
import { shortDate } from "../format";

export default function Customers() {
  const fetcher = useCallback(() => adminService.customers(), []);
  const { data, loading, error, reload } = useAdminData(fetcher);
  const customers = data || [];

  const columns = [
    {
      key: "name",
      label: "Customer",
      render: (row) => (
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
            {row.name || "—"}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {row.email}
          </Typography>
        </Box>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <Chip
          size="small"
          variant="outlined"
          color={row.role === "admin" ? "primary" : "default"}
          label={row.role || "customer"}
        />
      ),
    },
    {
      key: "created_at",
      label: "Joined",
      sortValue: (row) => new Date(row.created_at || 0).getTime(),
      render: (row) => shortDate(row.created_at),
    },
    {
      key: "id",
      label: "User id",
      align: "right",
      render: (row) => (
        <Typography sx={{ fontSize: 11.5, fontFamily: "monospace", color: "text.secondary" }}>
          {row.id}
        </Typography>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} registered account${customers.length === 1 ? "" : "s"}`}
      />
      <DataTable
        columns={columns}
        rows={customers}
        getRowId={(row) => row.id}
        loading={loading}
        error={error}
        onRetry={reload}
        searchPlaceholder="Search by name or email…"
        initialSort={{ key: "created_at", dir: "desc" }}
        emptyTitle="No customers yet"
      />
    </Box>
  );
}
