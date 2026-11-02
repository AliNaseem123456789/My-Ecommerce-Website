import { useCallback, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import { adminService } from "../../services/admin.service";
import useAdminData from "../hooks/useAdminData";
import { money, shortDate } from "../format";

const EMPTY = {
  code: "",
  type: "percent",
  value: "",
  min_order: "",
  usage_limit: "",
  per_user_limit: "",
  starts_at: "",
  expires_at: "",
  active: true,
};

export default function Coupons() {
  const fetcher = useCallback(() => adminService.coupons(), []);
  const { data, loading, error, reload } = useAdminData(fetcher);
  const coupons = data || [];

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setErrors({});
    setFormError("");
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      code: row.code || "",
      type: row.type || "percent",
      value: String(row.value ?? ""),
      min_order: row.min_order != null ? String(row.min_order) : "",
      usage_limit: row.usage_limit != null ? String(row.usage_limit) : "",
      per_user_limit: row.per_user_limit != null ? String(row.per_user_limit) : "",
      starts_at: row.starts_at ? String(row.starts_at).slice(0, 10) : "",
      expires_at: row.expires_at ? String(row.expires_at).slice(0, 10) : "",
      active: row.active !== false,
    });
    setErrors({});
    setFormError("");
    setOpen(true);
  };

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const validate = () => {
    const next = {};
    if (!form.code.trim()) next.code = "Code is required.";
    const value = Number(form.value);
    if (form.value === "") next.value = "Value is required.";
    else if (Number.isNaN(value) || value <= 0) next.value = "Must be greater than 0.";
    else if (form.type === "percent" && value > 100)
      next.value = "A percentage cannot exceed 100.";
    if (form.starts_at && form.expires_at && form.starts_at > form.expires_at)
      next.expires_at = "End date is before the start date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    setFormError("");
    if (!validate()) return;
    setSaving(true);

    const body = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      active: form.active,
    };
    if (form.min_order !== "") body.min_order = Number(form.min_order);
    if (form.usage_limit !== "") body.usage_limit = Number(form.usage_limit);
    if (form.per_user_limit !== "") body.per_user_limit = Number(form.per_user_limit);
    if (form.starts_at) body.starts_at = new Date(form.starts_at).toISOString();
    if (form.expires_at) body.expires_at = new Date(form.expires_at).toISOString();

    try {
      if (editingId) await adminService.updateCoupon(editingId, body);
      else await adminService.createCoupon(body);
      setOpen(false);
      await reload();
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          "Could not save this coupon. The code may already exist.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminService.deleteCoupon(toDelete.id);
      setToDelete(null);
      await reload();
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (row) => (
        <Typography sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13.5 }}>
          {row.code}
        </Typography>
      ),
    },
    {
      key: "value",
      label: "Discount",
      sortValue: (row) => Number(row.value ?? 0),
      render: (row) =>
        row.type === "percent" ? `${Number(row.value)}%` : money(row.value),
    },
    {
      key: "min_order",
      label: "Min order",
      render: (row) => (row.min_order != null ? money(row.min_order) : "—"),
    },
    {
      key: "redemption_count",
      label: "Used",
      align: "right",
      sortValue: (row) => Number(row.redemption_count ?? 0),
      render: (row) =>
        `${row.redemption_count ?? 0}${row.usage_limit ? ` / ${row.usage_limit}` : ""}`,
    },
    {
      key: "expires_at",
      label: "Expires",
      sortValue: (row) => new Date(row.expires_at || "2999-01-01").getTime(),
      render: (row) => (row.expires_at ? shortDate(row.expires_at) : "No expiry"),
    },
    {
      key: "active",
      label: "Status",
      render: (row) => {
        const expired = row.expires_at && new Date(row.expires_at) < new Date();
        if (expired)
          return <Chip size="small" variant="outlined" color="default" label="Expired" />;
        return (
          <Chip
            size="small"
            variant="outlined"
            color={row.active === false ? "default" : "success"}
            label={row.active === false ? "Inactive" : "Active"}
          />
        );
      },
    },
    {
      key: "actions",
      label: "",
      align: "right",
      sortable: false,
      render: (row) => (
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(row)}>
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
        title="Coupons"
        subtitle={`${coupons.length} coupon${coupons.length === 1 ? "" : "s"}`}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            New coupon
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={coupons}
        getRowId={(row) => row.id}
        loading={loading}
        error={error}
        onRetry={reload}
        searchPlaceholder="Search codes…"
        emptyTitle="No coupons yet"
        emptyMessage="Create a code and it becomes usable at checkout straight away."
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 17 }}>
          {editingId ? "Edit coupon" : "New coupon"}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr", pt: 1 }}>
            <TextField
              label="Code"
              value={form.code}
              onChange={setField("code")}
              error={Boolean(errors.code)}
              helperText={errors.code || "Stored uppercase"}
              required
            />
            <TextField select label="Type" value={form.type} onChange={setField("type")}>
              <MenuItem value="percent">Percentage off</MenuItem>
              <MenuItem value="fixed">Fixed amount off</MenuItem>
            </TextField>
            <TextField
              label={form.type === "percent" ? "Percent off" : "Amount off"}
              value={form.value}
              onChange={setField("value")}
              error={Boolean(errors.value)}
              helperText={errors.value}
              type="number"
              required
            />
            <TextField
              label="Minimum order"
              value={form.min_order}
              onChange={setField("min_order")}
              type="number"
              helperText="Optional"
            />
            <TextField
              label="Total uses"
              value={form.usage_limit}
              onChange={setField("usage_limit")}
              type="number"
              helperText="Optional"
            />
            <TextField
              label="Uses per customer"
              value={form.per_user_limit}
              onChange={setField("per_user_limit")}
              type="number"
              helperText="Optional"
            />
            <TextField
              label="Starts"
              value={form.starts_at}
              onChange={setField("starts_at")}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Expires"
              value={form.expires_at}
              onChange={setField("expires_at")}
              error={Boolean(errors.expires_at)}
              helperText={errors.expires_at}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
            <Switch
              checked={form.active}
              onChange={(event) =>
                setForm((current) => ({ ...current, active: event.target.checked }))
              }
            />
            <Typography sx={{ fontSize: 14 }}>Active</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={save} disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Create coupon"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete coupon"
        message={`Delete ${toDelete?.code}? Existing redemptions are kept.`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
