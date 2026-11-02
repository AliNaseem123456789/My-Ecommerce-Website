import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
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
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import { adminService } from "../../services/admin.service";
import useAdminData from "../hooks/useAdminData";
import { shortDate, money } from "../format";

const EMPTY = {
  name: "",
  headline: "",
  description: "",
  active: true,
  sort_order: 0,
  starts_at: "",
  expires_at: "",
};

export default function Collections() {
  const fetcher = useCallback(() => adminService.collections(), []);
  const { data, loading, error, reload, setData } = useAdminData(fetcher);
  const collections = data || [];

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

  // Product picker
  const [picker, setPicker] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [chosen, setChosen] = useState([]);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerBusy, setPickerBusy] = useState(false);

  const patch = async (row, body) => {
    const previous = data || [];
    setData(
      previous.map((item) =>
        item.collection_id === row.collection_id ? { ...item, ...body } : item,
      ),
    );
    setBusyId(row.collection_id);
    setActionError("");
    try {
      const updated = await adminService.updateCollection(row.collection_id, body);
      setData((current) =>
        (current || []).map((item) =>
          item.collection_id === row.collection_id ? { ...item, ...updated } : item,
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
        headline: form.headline.trim() || undefined,
        description: form.description.trim() || undefined,
        active: form.active,
        sort_order: Number(form.sort_order) || 0,
      };
      if (form.starts_at) body.starts_at = new Date(form.starts_at).toISOString();
      if (form.expires_at) body.expires_at = new Date(form.expires_at).toISOString();

      if (editingId) await adminService.updateCollection(editingId, body);
      else await adminService.createCollection(body);
      setOpen(false);
      setToast(editingId ? "Collection saved" : "Collection created");
      await reload();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not save this collection.");
    } finally {
      setSaving(false);
    }
  };

  const openPicker = async (row) => {
    setPicker(row);
    setPickerQuery("");
    setPickerBusy(true);
    try {
      const [products, current] = await Promise.all([
        adminService.products(),
        adminService.collectionProducts(row.collection_id),
      ]);
      setAllProducts(products || []);
      setChosen((current || []).map((item) => item.product_id));
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not load products.");
      setPicker(null);
    } finally {
      setPickerBusy(false);
    }
  };

  const savePicker = async () => {
    setPickerBusy(true);
    try {
      await adminService.setCollectionProducts(picker.collection_id, chosen);
      setPicker(null);
      setToast("Collection updated");
      await reload();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not save the products.");
    } finally {
      setPickerBusy(false);
    }
  };

  const onFileChosen = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const id = uploadTarget.current;
    if (!file || !id) return;
    setBusyId(id);
    try {
      await adminService.uploadCollectionImage(id, file);
      setToast("Image updated");
      await reload();
    } catch (err) {
      setActionError(err?.response?.data?.message || "The image could not be uploaded.");
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      key: "image_url",
      label: "",
      width: 68,
      sortable: false,
      render: (row) => (
        <Avatar
          src={row.image_url || undefined}
          variant="rounded"
          sx={{ width: 46, height: 46, bgcolor: "#f3f4f6" }}
        />
      ),
    },
    {
      key: "name",
      label: "Collection",
      render: (row) => (
        <Box sx={{ maxWidth: 340 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{row.name}</Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }} noWrap>
            /{row.slug}
            {row.headline ? ` · ${row.headline}` : ""}
          </Typography>
        </Box>
      ),
    },
    {
      key: "products",
      label: "Products",
      align: "right",
      sortValue: (row) => row._count?.collection_products ?? 0,
      render: (row) => (
        <Chip
          size="small"
          variant="outlined"
          color={(row._count?.collection_products ?? 0) === 0 ? "warning" : "default"}
          label={row._count?.collection_products ?? 0}
        />
      ),
    },
    {
      key: "window",
      label: "Runs",
      sortable: false,
      render: (row) =>
        row.starts_at || row.expires_at ? (
          <Typography sx={{ fontSize: 12.5 }}>
            {row.starts_at ? shortDate(row.starts_at) : "now"} →{" "}
            {row.expires_at ? shortDate(row.expires_at) : "no end"}
          </Typography>
        ) : (
          <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>Always</Typography>
        ),
    },
    {
      key: "active",
      label: "Active",
      sortValue: (row) => (row.active === false ? 0 : 1),
      render: (row) => (
        <Switch
          checked={row.active !== false}
          disabled={busyId === row.collection_id}
          onChange={(event) => patch(row, { active: event.target.checked })}
        />
      ),
    },
    {
      key: "sort_order",
      label: "Order",
      align: "right",
      width: 100,
      sortValue: (row) => Number(row.sort_order ?? 0),
      render: (row) => (
        <TextField
          type="number"
          defaultValue={row.sort_order ?? 0}
          disabled={busyId === row.collection_id}
          inputProps={{ style: { textAlign: "right", width: 48 } }}
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
          <Tooltip title="Choose products">
            <IconButton size="small" onClick={() => openPicker(row)}>
              <Inventory2OutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Upload image">
            <IconButton
              size="small"
              disabled={busyId === row.collection_id}
              onClick={() => {
                uploadTarget.current = row.collection_id;
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
                setEditingId(row.collection_id);
                setForm({
                  name: row.name || "",
                  headline: row.headline || "",
                  description: row.description || "",
                  active: row.active !== false,
                  sort_order: row.sort_order ?? 0,
                  starts_at: row.starts_at ? String(row.starts_at).slice(0, 10) : "",
                  expires_at: row.expires_at ? String(row.expires_at).slice(0, 10) : "",
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

  const visibleProducts = allProducts.filter((product) => {
    const needle = pickerQuery.trim().toLowerCase();
    if (!needle) return true;
    return (
      product.name?.toLowerCase().includes(needle) ||
      String(product.product_id).includes(needle)
    );
  });

  return (
    <Box>
      <PageHeader
        title="Collections"
        subtitle={`${collections.length} collection${
          collections.length === 1 ? "" : "s"
        } · curated sets that cut across categories`}
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
            New collection
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
        rows={collections}
        getRowId={(row) => row.collection_id}
        loading={loading}
        error={error}
        onRetry={reload}
        searchPlaceholder="Search collections…"
        initialSort={{ key: "sort_order", dir: "asc" }}
        emptyTitle="No collections yet"
        emptyMessage="A collection is a hand-picked set, like “Gift guide” or “Winter sale”."
      />

      <input
        ref={fileInput}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onFileChosen}
      />

      {/* create / edit */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 17 }}>
          {editingId ? "Edit collection" : "New collection"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              label="Name"
              placeholder="Gift guide"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
              fullWidth
              helperText="Used for the URL. Changing it does not change an existing slug."
            />
            <TextField
              label="Headline"
              placeholder="Find their soon-to-be favourite"
              value={form.headline}
              onChange={(event) => setForm({ ...form, headline: event.target.value })}
              fullWidth
              helperText="Shown on the card instead of the name, when set."
            />
            <TextField
              label="Description"
              placeholder="Thoughtful picks for everyone on the list."
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              multiline
              minRows={2}
              fullWidth
            />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Starts"
                type="date"
                value={form.starts_at}
                onChange={(event) => setForm({ ...form, starts_at: event.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Ends"
                type="date"
                value={form.expires_at}
                onChange={(event) => setForm({ ...form, expires_at: event.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                label="Order"
                type="number"
                value={form.sort_order}
                onChange={(event) => setForm({ ...form, sort_order: event.target.value })}
                sx={{ width: 140 }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Switch
                  checked={form.active}
                  onChange={(event) => setForm({ ...form, active: event.target.checked })}
                />
                <Typography sx={{ fontSize: 14 }}>Active</Typography>
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

      {/* product picker */}
      <Dialog open={Boolean(picker)} onClose={() => setPicker(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 17 }}>
          Products in “{picker?.name}”
          <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 400 }}>
            {chosen.length} selected · order follows the list below
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            placeholder="Search products…"
            value={pickerQuery}
            onChange={(event) => setPickerQuery(event.target.value)}
            fullWidth
            sx={{ mb: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <List dense sx={{ maxHeight: 380, overflow: "auto" }}>
            {visibleProducts.map((product) => {
              const selected = chosen.includes(product.product_id);
              return (
                <ListItemButton
                  key={product.product_id}
                  onClick={() =>
                    setChosen((current) =>
                      selected
                        ? current.filter((id) => id !== product.product_id)
                        : [...current, product.product_id],
                    )
                  }
                >
                  <Checkbox edge="start" checked={selected} tabIndex={-1} disableRipple />
                  <Avatar
                    src={product.image_url || undefined}
                    variant="rounded"
                    sx={{ width: 36, height: 36, mr: 1.5, bgcolor: "#f3f4f6" }}
                  />
                  <ListItemText
                    primary={product.name}
                    secondary={`#${product.product_id} · ${money(product.price)}`}
                    primaryTypographyProps={{ fontSize: 14 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                </ListItemButton>
              );
            })}
            {visibleProducts.length === 0 && (
              <Typography sx={{ p: 2, color: "text.secondary", fontSize: 14 }}>
                No products match that search.
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPicker(null)} disabled={pickerBusy}>
            Cancel
          </Button>
          <Button variant="contained" onClick={savePicker} disabled={pickerBusy}>
            {pickerBusy ? "Saving…" : "Save products"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete collection"
        message={`Delete “${toDelete?.name}”? The products themselves are not affected.`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={async () => {
          setDeleting(true);
          try {
            await adminService.deleteCollection(toDelete.collection_id);
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
