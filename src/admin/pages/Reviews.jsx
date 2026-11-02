import { useCallback, useState } from "react";
import { Box, Chip, IconButton, Rating, Tooltip, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import { adminService } from "../../services/admin.service";
import useAdminData from "../hooks/useAdminData";
import { shortDate } from "../format";

export default function Reviews() {
  const fetcher = useCallback(() => adminService.reviews(), []);
  const { data, loading, error, reload } = useAdminData(fetcher);
  const reviews = data || [];

  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await adminService.deleteReview(toDelete.review_id);
      setToDelete(null);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      key: "product",
      label: "Product",
      searchValue: (row) => row.products?.name || "",
      sortValue: (row) => row.products?.name || "",
      render: (row) => (
        <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
          {row.products?.name || `#${row.product_id}`}
        </Typography>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      sortValue: (row) => Number(row.rating ?? 0),
      render: (row) => (
        <Rating value={Number(row.rating ?? 0)} precision={0.5} readOnly size="small" />
      ),
    },
    {
      key: "title",
      label: "Review",
      render: (row) => (
        <Box sx={{ maxWidth: 420 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{row.title}</Typography>
          <Typography
            sx={{
              fontSize: 12.5,
              color: "text.secondary",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {row.review}
          </Typography>
        </Box>
      ),
    },
    {
      key: "name",
      label: "Author",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Box>
            <Typography sx={{ fontSize: 13 }}>{row.name}</Typography>
            <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
              {row.email}
            </Typography>
          </Box>
          {row.verified && (
            <Tooltip title="Verified purchase">
              <VerifiedOutlinedIcon fontSize="small" color="success" />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      sortValue: (row) => new Date(row.created_at || 0).getTime(),
      render: (row) => shortDate(row.created_at),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      sortable: false,
      render: (row) => (
        <Tooltip title="Delete review">
          <IconButton size="small" color="error" onClick={() => setToDelete(row)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const verified = reviews.filter((row) => row.verified).length;

  return (
    <Box>
      <PageHeader
        title="Reviews"
        subtitle={`${reviews.length} review${reviews.length === 1 ? "" : "s"}${
          verified ? ` · ${verified} verified` : ""
        }`}
      />
      <DataTable
        columns={columns}
        rows={reviews}
        getRowId={(row) => row.review_id}
        loading={loading}
        error={error}
        onRetry={reload}
        searchPlaceholder="Search reviews…"
        initialSort={{ key: "created_at", dir: "desc" }}
        emptyTitle="No reviews yet"
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete review"
        message="This removes the review and recalculates the product rating."
        confirmLabel="Delete"
        destructive
        busy={busy}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
