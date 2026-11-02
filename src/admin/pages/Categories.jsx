import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Snackbar,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import { adminService } from "../../services/admin.service";
import useAdminData from "../hooks/useAdminData";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;

export default function Categories() {
  const fetcher = useCallback(() => adminService.categories(), []);
  const { data, loading, error, reload, setData } = useAdminData(fetcher);
  const categories = data || [];

  const fileInput = useRef(null);
  const uploadTarget = useRef(null);

  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [toast, setToast] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const featuredCount = categories.filter((row) => row.featured).length;

  /**
   * Applies the change locally first so the control responds immediately,
   * then reconciles with whatever the server actually saved. On failure the
   * previous value is restored and the reason is shown, rather than the
   * control silently refusing to move.
   */
  const patch = async (row, body, message) => {
    const previous = data || [];
    setData(
      previous.map((item) =>
        item.category_id === row.category_id ? { ...item, ...body } : item,
      ),
    );
    setBusyId(row.category_id);
    setActionError("");

    try {
      const updated = await adminService.updateCategory(row.category_id, body);

      // Trust the server's version of the row, keeping _count from the list.
      if (updated && updated.category_id !== undefined) {
        setData((current) =>
          (current || []).map((item) =>
            item.category_id === row.category_id
              ? { ...item, ...updated }
              : item,
          ),
        );

        // The save returned 200 but the field did not change: say so instead
        // of letting the control quietly spring back.
        const [field] = Object.keys(body);
        if (field && updated[field] !== body[field]) {
          setActionError(
            `The server saved this category but "${field}" came back as ` +
              `${JSON.stringify(updated[field])} instead of ` +
              `${JSON.stringify(body[field])}. The request body may not be reaching it.`,
          );
          return;
        }
      }

      if (message) setToast(message);
    } catch (err) {
      setData(previous);
      setActionError(
        err?.response?.data?.message ||
          err?.message ||
          "That change could not be saved.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const pickImage = (row) => {
    uploadTarget.current = row.category_id;
    fileInput.current?.click();
  };

  const onFileChosen = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const categoryId = uploadTarget.current;
    if (!file || !categoryId) return;

    if (!ALLOWED.includes(file.type)) {
      setActionError("Only JPEG, PNG, WebP and AVIF images are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setActionError("Images must be 5 MB or smaller.");
      return;
    }

    setBusyId(categoryId);
    setActionError("");
    try {
      await adminService.uploadCategoryImage(categoryId, file);
      setToast("Category image updated");
      await reload();
    } catch (err) {
      setActionError(
        err?.response?.data?.message || "The image could not be uploaded.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const createCategory = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setActionError("");
    try {
      await adminService.createCategory({ name: newName.trim() });
      setCreateOpen(false);
      setNewName("");
      setToast("Category created");
      await reload();
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          "Could not create that category. The name may already exist.",
      );
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      key: "image_url",
      label: "",
      width: 72,
      sortable: false,
      render: (row) => (
        <Tooltip title={row.image_url ? "Change image" : "Upload image"}>
          <IconButton
            onClick={() => pickImage(row)}
            disabled={busyId === row.category_id}
            sx={{ p: 0.25 }}
          >
            {row.image_url ? (
              <Avatar
                src={row.image_url}
                variant="rounded"
                sx={{ width: 52, height: 52 }}
              />
            ) : (
              <Avatar variant="rounded" sx={{ width: 52, height: 52, bgcolor: "#f3f4f6" }}>
                <ImageNotSupportedOutlinedIcon fontSize="small" sx={{ color: "#9ca3af" }} />
              </Avatar>
            )}
          </IconButton>
        </Tooltip>
      ),
    },
    {
      key: "name",
      label: "Category",
      render: (row) => (
        <Box sx={{ pl: row.parent_id ? 3 : 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
            {row.parent_id ? `↳ ${row.name}` : row.name}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {row.parent?.name ? `in ${row.parent.name} · ` : ""}
            {row._count?.products ?? 0} product
            {(row._count?.products ?? 0) === 1 ? "" : "s"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "parent_id",
      label: "Parent",
      sortValue: (row) => row.parent?.name || "",
      searchValue: (row) => row.parent?.name || "",
      render: (row) => (
        <TextField
          select
          value={row.parent_id ? String(row.parent_id) : ""}
          disabled={busyId === row.category_id}
          sx={{ minWidth: 150 }}
          onChange={(event) =>
            patch(row, {
              parent_id: event.target.value ? Number(event.target.value) : null,
            })
          }
        >
          <MenuItem value="">Top level</MenuItem>
          {(data || [])
            .filter(
              (option) =>
                option.category_id !== row.category_id && !option.parent_id,
            )
            .map((option) => (
              <MenuItem key={option.category_id} value={String(option.category_id)}>
                {option.name}
              </MenuItem>
            ))}
        </TextField>
      ),
    },
    {
      key: "featured",
      label: "On landing page",
      sortValue: (row) => (row.featured ? 1 : 0),
      render: (row) => (
        <Switch
          checked={Boolean(row.featured)}
          disabled={busyId === row.category_id}
          onChange={(event) =>
            patch(
              row,
              { featured: event.target.checked },
              event.target.checked
                ? `${row.name} added to the landing page`
                : `${row.name} removed from the landing page`,
            )
          }
        />
      ),
    },
    {
      key: "sort_order",
      label: "Order",
      align: "right",
      width: 120,
      sortValue: (row) => Number(row.sort_order ?? 0),
      render: (row) => (
        <TextField
          type="number"
          defaultValue={row.sort_order ?? 0}
          disabled={busyId === row.category_id}
          inputProps={{ style: { textAlign: "right", width: 56 } }}
          onBlur={(event) => {
            const value = Number(event.target.value);
            if (Number.isNaN(value) || value === Number(row.sort_order ?? 0)) return;
            patch(row, { sort_order: value });
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      sortable: false,
      render: (row) => (
        <Button
          size="small"
          startIcon={<ImageOutlinedIcon />}
          onClick={() => pickImage(row)}
          disabled={busyId === row.category_id}
        >
          {row.image_url ? "Replace" : "Upload"}
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} categories · ${featuredCount} shown on the landing page`}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            New category
          </Button>
        }
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError("")}>
          {actionError}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        The landing page shows featured categories in <strong>Order</strong> — the
        first one fills the large tile, the rest fill the smaller tiles. Five works
        best with the current layout.
      </Alert>

      <DataTable
        columns={columns}
        rows={categories}
        getRowId={(row) => row.category_id}
        loading={loading}
        error={error}
        onRetry={reload}
        searchPlaceholder="Search categories…"
        initialSort={{ key: "sort_order", dir: "asc" }}
        initialRowsPerPage={25}
        emptyTitle="No categories yet"
      />

      <input
        ref={fileInput}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onFileChosen}
      />

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 17 }}>New category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button variant="contained" onClick={createCategory} disabled={creating}>
            {creating ? "Creating…" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

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
