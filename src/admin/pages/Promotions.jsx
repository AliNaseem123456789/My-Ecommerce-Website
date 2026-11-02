import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
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
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import { adminService } from "../../services/admin.service";
import useAdminData from "../hooks/useAdminData";
import { shortDate } from "../format";

const ACCENTS = [
  { value: "sand", label: "Sand", swatch: "#faf6f0" },
  { value: "sage", label: "Sage", swatch: "#f2f6f2" },
  { value: "mist", label: "Mist", swatch: "#f2f5f9" },
  { value: "blush", label: "Blush", swatch: "#faf2f3" },
  { value: "ink", label: "Ink", swatch: "#f4f4f5" },
];

const EMPTY = {
  headline: "",
  subhead: "",
  fine_print: "",
  badge: "",
  link_url: "",
  accent: "sand",
  coupon_code: "",
  active: true,
  sort_order: 0,
  starts_at: "",
  expires_at: "",
};

export default function Promotions() {
  const fetcher = useCallback(() => adminService.promotions(), []);
  const { data, loading, error, reload, setData } = useAdminData(fetcher);
  const promos = data || [];

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

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const patch = async (row, body) => {
    const previous = data || [];
    setData(
      previous.map((item) =>
        item.promotion_id === row.promotion_id ? { ...item, ...body } : item,
      ),
    );
    setBusyId(row.promotion_id);
    setActionError("");
    try {
      const updated = await adminService.updatePromotion(row.promotion_id, body);
      setData((current) =>
        (current || []).map((item) =>
          item.promotion_id === row.promotion_id ? { ...item, ...updated } : item,
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
    if (!form.headline.trim()) return;
    setSaving(true);
    setActionError("");
    try {
      const body = {
        headline: form.headline.trim(),
        subhead: form.subhead.trim() || undefined,
        fine_print: form.fine_print.trim() || undefined,
        badge: form.badge.trim() || undefined,
        link_url: form.link_url.trim() || undefined,
        accent: form.accent,
        coupon_code: form.coupon_code.trim().toUpperCase() || undefined,
        active: form.active,
        sort_order: Number(form.sort_order) || 0,
      };
      if (form.starts_at) body.starts_at = new Date(form.starts_at).toISOString();
      if (form.expires_at) body.expires_at = new Date(form.expires_at).toISOString();

      if (editingId) await adminService.updatePromotion(editingId, body);
      else await adminService.createPromotion(body);
      setOpen(false);
      setToast(editingId ? "Promotion saved" : "Promotion created");
      await reload();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not save this promotion.");
    } finally {
      setSaving(false);
    }
  };

  const onFileChosen = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const id = uploadTarget.current;
    if (!file || !id) return;
    setBusyId(id);
    try {
      await adminService.uploadPromotionImage(id, file);
      setToast("Image updated");
      await reload();
    } catch (err) {
      setActionError(err?.response?.data?.message || "The image could not be uploaded.");
    } finally {
      setBusyId(null);
    }
  };

  const liveNow = (row) => {
    const now = new Date();
    if (row.active === false) return false;
    if (row.starts_at && new Date(row.starts_at) > now) return false;
    if (row.expires_at && new Date(row.expires_at) < now) return false;
    return true;
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
      key: "headline",
      label: "Promotion",
      render: (row) => (
        <Box sx={{ maxWidth: 360 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{row.headline}</Typography>
          {row.subhead && (
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }} noWrap>
              {row.subhead}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "badge",
      label: "Badge",
      render: (row) =>
        row.badge ? <Chip size="small" label={row.badge} variant="outlined" /> : "—",
    },
    {
      key: "accent",
      label: "Accent",
      render: (row) => {
        const accent = ACCENTS.find((item) => item.value === row.accent) || ACCENTS[0];
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "4px",
                border: "1px solid #e5e7eb",
                bgcolor: accent.swatch,
              }}
            />
            <Typography sx={{ fontSize: 13 }}>{accent.label}</Typography>
          </Box>
        );
      },
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
      label: "Live",
      sortValue: (row) => (liveNow(row) ? 1 : 0),
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Switch
            checked={row.active !== false}
            disabled={busyId === row.promotion_id}
            onChange={(event) => patch(row, { active: event.target.checked })}
          />
          {row.active !== false && !liveNow(row) && (
            <Tooltip title="Active, but outside its date window">
              <Chip size="small" label="scheduled" variant="outlined" color="warning" />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      sortable: false,
      render: (row) => (
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <Tooltip title="Upload image">
            <IconButton
              size="small"
              disabled={busyId === row.promotion_id}
              onClick={() => {
                uploadTarget.current = row.promotion_id;
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
                setEditingId(row.promotion_id);
                setForm({
                  headline: row.headline || "",
                  subhead: row.subhead || "",
                  fine_print: row.fine_print || "",
                  badge: row.badge || "",
                  link_url: row.link_url || "",
                  accent: row.accent || "sand",
                  coupon_code: row.coupon_code || "",
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

  return (
    <Box>
      <PageHeader
        title="Promotions"
        subtitle={`${promos.length} promotion${promos.length === 1 ? "" : "s"} · ${
          promos.filter(liveNow).length
        } live right now`}
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
            New promotion
          </Button>
        }
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError("")}>
          {actionError}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        Promotion cards appear on the landing page in <strong>Order</strong>. They are
        advertising only — a coupon code shown here still has to exist in{" "}
        <strong>Coupons</strong> to actually work at checkout.
      </Alert>

      <DataTable
        columns={columns}
        rows={promos}
        getRowId={(row) => row.promotion_id}
        loading={loading}
        error={error}
        onRetry={reload}
        searchPlaceholder="Search promotions…"
        emptyTitle="No promotions yet"
        emptyMessage="Create one and it shows up on the landing page straight away."
      />

      <input
        ref={fileInput}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onFileChosen}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 17 }}>
          {editingId ? "Edit promotion" : "New promotion"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              label="Headline"
              placeholder="25% off kitchen essentials"
              value={form.headline}
              onChange={setField("headline")}
              required
              fullWidth
            />
            <TextField
              label="Subhead"
              placeholder="Everything you need for the season"
              value={form.subhead}
              onChange={setField("subhead")}
              fullWidth
            />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Badge"
                placeholder="Today only"
                value={form.badge}
                onChange={setField("badge")}
              />
              <TextField select label="Accent" value={form.accent} onChange={setField("accent")}>
                {ACCENTS.map((accent) => (
                  <MenuItem key={accent.value} value={accent.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: "3px",
                          border: "1px solid #e5e7eb",
                          bgcolor: accent.swatch,
                        }}
                      />
                      {accent.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Coupon code"
                placeholder="SAVE25"
                value={form.coupon_code}
                onChange={setField("coupon_code")}
              />
              <TextField
                label="Links to"
                placeholder="/shop?category=4"
                value={form.link_url}
                onChange={setField("link_url")}
              />
              <TextField
                label="Starts"
                type="date"
                value={form.starts_at}
                onChange={setField("starts_at")}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Ends"
                type="date"
                value={form.expires_at}
                onChange={setField("expires_at")}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              label="Fine print"
              placeholder="Selected items only. While stocks last."
              value={form.fine_print}
              onChange={setField("fine_print")}
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                label="Order"
                type="number"
                value={form.sort_order}
                onChange={setField("sort_order")}
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

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete promotion"
        message={`Delete "${toDelete?.headline}"? It disappears from the landing page immediately.`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={async () => {
          setDeleting(true);
          try {
            await adminService.deletePromotion(toDelete.promotion_id);
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
