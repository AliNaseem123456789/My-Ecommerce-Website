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
  Paper,
  Snackbar,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PageHeader from "../components/PageHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import { adminService } from "../../services/admin.service";
import useAdminData from "../hooks/useAdminData";

const TYPES = [
  { value: "promo_grid", label: "Promotion cards", hint: "Your live promotions" },
  { value: "collection_grid", label: "Collection cards", hint: "Your active collections" },
  { value: "product_rail", label: "Product row", hint: "A scrolling row of products" },
  { value: "shop_by_price", label: "Shop by price", hint: "Three price band tiles" },
  { value: "brand_strip", label: "Brand logos", hint: "Your featured brands" },
  { value: "testimonials", label: "Testimonials", hint: "Customer quotes" },
  { value: "recently_viewed", label: "Recently viewed", hint: "Per-visitor history" },
];

const SOURCES = [
  { value: "best_sellers", label: "Best sellers" },
  { value: "new_arrivals", label: "New arrivals" },
  { value: "top_rated", label: "Top rated" },
  { value: "most_wishlisted", label: "Most wishlisted" },
  { value: "collection", label: "A specific collection" },
];

const EMPTY = {
  type: "product_rail",
  title: "",
  subtitle: "",
  source: "best_sellers",
  collection_slug: "",
  limit: 10,
  tinted: false,
  active: true,
};

export default function LandingPageSections() {
  const fetcher = useCallback(
    () => Promise.all([adminService.landingSections(), adminService.collections()]),
    [],
  );
  const { data, loading, error, reload, setData } = useAdminData(fetcher);
  const sections = data?.[0] || [];
  const collections = data?.[1] || [];

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [toast, setToast] = useState("");
  const [toDelete, setToDelete] = useState(null);

  const setSections = (next) => setData([next, collections]);

  const typeLabel = (type) =>
    TYPES.find((item) => item.value === type)?.label || type;

  const describe = (section) => {
    const config = section.config || {};
    if (section.type !== "product_rail") return typeLabel(section.type);
    if (config.source === "collection") {
      const match = collections.find((item) => item.slug === config.collection_slug);
      return `Products from “${match?.name || config.collection_slug || "—"}”`;
    }
    return SOURCES.find((item) => item.value === config.source)?.label || "Products";
  };

  const move = async (index, delta) => {
    const next = [...sections];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    setBusy(true);
    try {
      await adminService.reorderSections(next.map((row) => row.section_id));
    } catch (err) {
      setActionError(err?.response?.data?.message || "Reordering failed.");
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (section, value) => {
    const previous = sections;
    setSections(
      sections.map((row) =>
        row.section_id === section.section_id ? { ...row, active: value } : row,
      ),
    );
    try {
      await adminService.updateSection(section.section_id, {
        type: section.type,
        active: value,
      });
    } catch (err) {
      setSections(previous);
      setActionError(err?.response?.data?.message || "That change was not saved.");
    }
  };

  const save = async () => {
    setSaving(true);
    setActionError("");
    try {
      const config = {};
      if (form.type === "product_rail") {
        config.source = form.source;
        if (form.source === "collection") config.collection_slug = form.collection_slug;
        config.limit = Number(form.limit) || 10;
      }
      if (form.type === "collection_grid") config.limit = Number(form.limit) || 4;
      config.tinted = Boolean(form.tinted);

      const body = {
        type: form.type,
        title: form.title.trim() || undefined,
        subtitle: form.subtitle.trim() || undefined,
        config,
        active: form.active,
      };

      if (editingId) await adminService.updateSection(editingId, body);
      else await adminService.createSection(body);

      setOpen(false);
      setToast(editingId ? "Section saved" : "Section added");
      await reload();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Could not save this section.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Landing page"
        subtitle="The order of these sections is the order of your home page."
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
            Add section
          </Button>
        }
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError("")}>
          {actionError}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        The hero banner and <strong>Featured categories</strong> are fixed at the top
        and are not listed here. Everything below them is controlled from this screen.
        While this list is empty the site shows a sensible default layout.
      </Alert>

      {loading && <Typography sx={{ color: "text.secondary" }}>Loading…</Typography>}

      {!loading && error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && !error && sections.length === 0 && (
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <Typography sx={{ fontWeight: 600 }}>No sections configured</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            The landing page is showing its default layout. Add a section to take over.
          </Typography>
        </Paper>
      )}

      {!loading && !error && (
        <Box sx={{ display: "grid", gap: 1.25 }}>
          {sections.map((section, index) => (
            <Paper
              key={section.section_id}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                opacity: section.active ? 1 : 0.55,
              }}
            >
              <Box sx={{ display: "grid" }}>
                <IconButton
                  size="small"
                  disabled={busy || index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={busy || index === sections.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              <Typography
                sx={{ width: 26, textAlign: "center", color: "text.secondary", fontSize: 13 }}
              >
                {index + 1}
              </Typography>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
                  {section.title || typeLabel(section.type)}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }} noWrap>
                  {describe(section)}
                  {section.subtitle ? ` · ${section.subtitle}` : ""}
                </Typography>
              </Box>

              {section.config?.tinted && (
                <Chip size="small" variant="outlined" label="tinted" />
              )}
              <Chip size="small" variant="outlined" label={typeLabel(section.type)} />

              <Tooltip title={section.active ? "Visible" : "Hidden"}>
                <Switch
                  checked={Boolean(section.active)}
                  onChange={(event) => toggleActive(section, event.target.checked)}
                />
              </Tooltip>

              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => {
                    const config = section.config || {};
                    setEditingId(section.section_id);
                    setForm({
                      type: section.type,
                      title: section.title || "",
                      subtitle: section.subtitle || "",
                      source: config.source || "best_sellers",
                      collection_slug: config.collection_slug || "",
                      limit: config.limit ?? 10,
                      tinted: Boolean(config.tinted),
                      active: Boolean(section.active),
                    });
                    setOpen(true);
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove">
                <IconButton size="small" color="error" onClick={() => setToDelete(section)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Paper>
          ))}
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 17 }}>
          {editingId ? "Edit section" : "Add section"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
            <TextField
              select
              label="Type"
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
            >
              {TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box>
                    <Typography sx={{ fontSize: 14 }}>{type.label}</Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {type.hint}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {form.type === "product_rail" && (
              <>
                <TextField
                  select
                  label="Products from"
                  value={form.source}
                  onChange={(event) => setForm({ ...form, source: event.target.value })}
                >
                  {SOURCES.map((source) => (
                    <MenuItem key={source.value} value={source.value}>
                      {source.label}
                    </MenuItem>
                  ))}
                </TextField>

                {form.source === "collection" && (
                  <TextField
                    select
                    label="Collection"
                    value={form.collection_slug}
                    onChange={(event) =>
                      setForm({ ...form, collection_slug: event.target.value })
                    }
                    helperText={
                      collections.length === 0
                        ? "Create a collection first."
                        : undefined
                    }
                  >
                    {collections.map((collection) => (
                      <MenuItem key={collection.collection_id} value={collection.slug}>
                        {collection.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </>
            )}

            <TextField
              label="Heading"
              placeholder="Leave blank to use the default"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              fullWidth
            />
            <TextField
              label="Sub-heading"
              value={form.subtitle}
              onChange={(event) => setForm({ ...form, subtitle: event.target.value })}
              fullWidth
            />

            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              {(form.type === "product_rail" || form.type === "collection_grid") && (
                <TextField
                  label="How many"
                  type="number"
                  value={form.limit}
                  onChange={(event) => setForm({ ...form, limit: event.target.value })}
                  sx={{ width: 130 }}
                />
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Switch
                  checked={form.tinted}
                  onChange={(event) => setForm({ ...form, tinted: event.target.checked })}
                />
                <Typography sx={{ fontSize: 14 }}>Tinted background</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Switch
                  checked={form.active}
                  onChange={(event) => setForm({ ...form, active: event.target.checked })}
                />
                <Typography sx={{ fontSize: 14 }}>Visible</Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={save} disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Remove section"
        message="This removes the section from the landing page. The underlying content is not deleted."
        confirmLabel="Remove"
        destructive
        onConfirm={async () => {
          try {
            await adminService.deleteSection(toDelete.section_id);
            setToDelete(null);
            await reload();
          } catch (err) {
            setActionError(err?.response?.data?.message || "Could not remove it.");
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
