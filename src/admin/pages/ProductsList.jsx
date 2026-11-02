import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Box, Button, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import { adminService } from "../../services/admin.service";
import { CategoriesService } from "../../services/categories.service";
import useAdminData from "../hooks/useAdminData";
import { money } from "../format";

export default function ProductsList() {
  const navigate = useNavigate();

  const fetcher = useCallback(
    () => Promise.all([adminService.products(), CategoriesService.getAllCategories()]),
    [],
  );
  const { data, loading, error, reload } = useAdminData(fetcher);

  const products = data?.[0] || [];
  const categories = data?.[1] || [];
  const categoryName = (id) =>
    categories.find((item) => item.category_id === id)?.name || "Uncategorised";

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  const confirmDelete = async () => {
    setDeleting(true);
    setActionError("");
    try {
      await adminService.deleteProduct(toDelete.product_id);
      setToDelete(null);
      await reload();
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          "Could not delete this product. It may be referenced by an existing order.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "image",
      label: "",
      width: 64,
      sortable: false,
      render: (row) =>
        row.image_url ? (
          <Avatar
            src={row.image_url}
            variant="rounded"
            sx={{ width: 44, height: 44, bgcolor: "#f3f4f6" }}
          />
        ) : (
          <Tooltip title="No image uploaded">
            <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: "#f3f4f6" }}>
              <ImageNotSupportedOutlinedIcon fontSize="small" sx={{ color: "#9ca3af" }} />
            </Avatar>
          </Tooltip>
        ),
    },
    {
      key: "name",
      label: "Product",
      render: (row) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{row.name}</Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            #{row.product_id}
          </Typography>
        </Box>
      ),
    },
    {
      key: "category_id",
      label: "Category",
      searchValue: (row) => categoryName(row.category_id),
      sortValue: (row) => categoryName(row.category_id),
      render: (row) => (
        <Chip
          size="small"
          label={categoryName(row.category_id)}
          variant="outlined"
          color={row.category_id ? "default" : "warning"}
        />
      ),
    },
    {
      key: "price",
      label: "Price",
      align: "right",
      sortValue: (row) => Number(row.price ?? 0),
      render: (row) => money(row.price),
    },
    {
      key: "stock",
      label: "Stock",
      align: "right",
      sortValue: (row) => Number(row.stock ?? 0),
      render: (row) => {
        const stock = Number(row.stock ?? 0);
        const tone = stock === 0 ? "error" : stock <= 5 ? "warning" : "success";
        return <Chip size="small" variant="outlined" color={tone} label={stock} />;
      },
    },
    {
      key: "avg_rating",
      label: "Rating",
      align: "right",
      sortValue: (row) => Number(row.avg_rating ?? 0),
      render: (row) => Number(row.avg_rating ?? 0).toFixed(1),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      sortable: false,
      width: 100,
      render: (row) => (
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/admin/products/${row.product_id}`);
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={(event) => {
                event.stopPropagation();
                setToDelete(row);
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const missingImages = products.filter((item) => !item.image_url).length;

  return (
    <Box>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products${
          missingImages ? ` · ${missingImages} with no image` : ""
        }`}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/products/new")}
          >
            New product
          </Button>
        }
      />

      {actionError && (
        <Typography color="error" sx={{ mb: 2, fontSize: 14 }}>
          {actionError}
        </Typography>
      )}

      <DataTable
        columns={columns}
        rows={products}
        getRowId={(row) => row.product_id}
        loading={loading}
        error={error}
        onRetry={reload}
        searchPlaceholder="Search by name, id or category…"
        initialSort={{ key: "product_id", dir: "asc" }}
        emptyTitle="No products yet"
        emptyMessage="Create your first product to see it in the store."
        onRowClick={(row) => navigate(`/admin/products/${row.product_id}`)}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete product"
        message={`Delete “${toDelete?.name}”? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
