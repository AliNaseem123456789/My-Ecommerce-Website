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
  Snackbar,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import { adminService } from "../../services/admin.service";
import useAdminData from "../hooks/useAdminData";

const EMPTY = { name: "", description: "", featured: false, sort_order: 0 };
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];

export default function Brands() {
  const fetcher = useCallback(() => adminService.brands(), []);
  const { data, loading, error, reload, setData } = useAdminData(fetcher);
  const brands = data || [];

  const fileInput = useRef(null);
  const uploadTarget = useRef(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [toast, setToast] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const patch = async (row, body) => {
    const previous = data || [];
    setData(
      previous.map((item) =>
        item.brand_id === row.brand_id ? { ...item, ...body } : item,
      ),
    );
    setBusyId(row.brand_id);
    setActionError("");
    try {
      const updated = await adminService.updateBrand(row.brand_id, body);
      setData((current) =>
        (current || []).map((item) =>
          item.brand_id === row.brand_id ? { ...item, ...updated } : item,
        ),
      );
    } catch (err) {
      setData(previous);
      setActionError(err?.response?.data?.message || "That change was not saved.");
    } finally {
      setBusyId(null);
    }
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setActionError("");
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        featured: form.featured,
        sort_order: Number(form.sort_order) || 0,
      };
      if (editingId) await adminService.updateBrand(editingId, body);
      else await adminService.createBrand(body);
      setOpen(false);
      setToast(editingId ? "Brand saved" : "Brand created");
      await reload();
    } catch (err) {
      setActionError(
        err?.response?.data?.message || "Could not save. The name may already exist.",
      );
    } finally {
      setSaving(false);
    }
  };

  const onFileChosen = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const brandId = uploadTarget.current;
    if (!file || !brandId) return;
    if (!ALLOWED.includes(file.type)) {
      setActionError("Logos must be JPEG, PNG, WebP, AVIF or SVG.");
      return;
    }
    setBusyId(brandId);
    try {
      await adminService.uploadBrandLogo(brandId, file);
      setToast("Logo updated");
      await reload();
    } catch (err) {
      setActionError(err?.response?.data?.message || "The logo could not be uploaded.");
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      key: "logo_url",
      label: "",
      width: 72,
      sortable: false,
      render: (row) => (
        <Avatar
          src={row.logo_url || undefined}
          variant="rounded"
          sx={{ width: 48, height: 48, bgcolor: "#f3f4f6", color: "#9ca3af", fontSize: 14 }}
        >
          {row.name?.charAt(0)}
        </Avatar>
      ),
    },
    {
      key: "name",
      label: "Brand",
      render: (row) => (
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{row.name}</Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            /{row.slug} · {row._count?.products ?? 0} product
            {(row._count?.products ?? 0) === 1 ? "" : "s"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "featured",
      label: "On landing page",
      sortValue: (row) => (row.featured ? 1 : 0),
      render: (row) => (
        <Switch
          checked={Boolean(row.featured)}
          disabled={busyId === row.brand_id}
          onChange={(event) => patch(row, { featured: event.target.checked })}
        />
      ),
    },
    {
      key: "sort_order",
      label: "Order",
      align: "right",
      width: 110,
      sortValue: (row) => Number(row.sort_order ?? 0),
      render: (row) => (
        <TextField
          type="number"
          defaultValue={row.sort_order ?? 0}
          disabled={busyId === row.brand_id}
          inputProps={{ style: { textAlign: "right", width: 52 } }}
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
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <Tooltip title="Upload logo">
            <IconButton
              size="small"
              disabled={busyId === row.brand_id}
              onClick={() => {
                uploadTarget.current = row.brand_id;
                fileInput.current?.click();
              }}
            >
              <ImageOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => {
                setEditingId(row.brand_id);
                setForm({
                  name: row.name || "",
                  description: row.description || "",
                  featured: Boolean(row.featured),
                  sort_order: row.sort_order ?? 0,
                });
                setOpen(true);
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setToDelete(row)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Brands"
        subtitle={`${brands.length} brand${brands.length === 1 ? "" : "s"} · ${
          brands.filter((row) => row.featured).length
        } on the landing page`}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingId(null);
              setForm(EMPTY);
              setOpen(true);
            }}
          >
            New brand
          </Button>
        }
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError("")}>
          {actionError}
        </Alert>
      )}

      <DataTable
        columns={columns}
        rows={brands}
        getRowId={(row) => row.brand_id}
        loading={loading}
        error={error}
        onRetry={reload}
        searchPlaceholder="Search brands…"
        initialSort={{ key: "sort_order", dir: "asc" }}
        emptyTitle="No brands yet"
        emptyMessage="Create a brand, then assign products to it from the product form."
      />

      <input
        ref={fileInput}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
        onChange={onFileChosen}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 17 }}>
          {editingId ? "Edit brand" : "New brand"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              label="Name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              multiline
              minRows={3}
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                label="Order"
                type="number"
                value={form.sort_order}
                onChange={(event) =>
                  setForm({ ...form, sort_order: event.target.value })
                }
                sx={{ width: 140 }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Switch
                  checked={form.featured}
                  onChange={(event) =>
                    setForm({ ...form, featured: event.target.checked })
                  }
                />
                <Typography sx={{ fontSize: 14 }}>Show on landing page</Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={save} disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete brand"
        message={`Delete ${toDelete?.name}? Products keep existing — they just lose their brand.`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={async () => {
          setDeleting(true);
          try {
            await adminService.deleteBrand(toDelete.brand_id);
            setToDelete(null);
            await reload();
          } finally {
            setDeleting(false);
          }
        }}
        onClose={() => setToDelete(null)}
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
