import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PageHeader from "../components/PageHeader";
import ImageGallery from "../components/ImageGallery";
import { adminService } from "../../services/admin.service";
import { CategoriesService } from "../../services/categories.service";

const EMPTY = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  category_id: "",
  brand_id: "",
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 6;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [toast, setToast] = useState("");

  // Create flow only: files chosen before the product exists.
  const [pending, setPending] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [categoryRows, brandRows] = await Promise.all([
        CategoriesService.getAllCategories(),
        adminService.brands().catch(() => []),
      ]);
      setCategories(categoryRows || []);
      setBrands(brandRows || []);

      if (!isEdit) {
        setLoading(false);
        return;
      }

      let product = null;
      try {
        product = await adminService.product(id);
      } catch {
        const all = await adminService.products();
        product = (all || []).find((row) => String(row.product_id) === String(id));
      }
      if (!product) {
        setLoadError("That product could not be found.");
        return;
      }

      setForm({
        name: product.name ?? "",
        description: product.description ?? "",
        price: String(product.price ?? ""),
        stock: String(product.stock ?? 0),
        category_id: product.category_id ? String(product.category_id) : "",
        brand_id: product.brand_id ? String(product.brand_id) : "",
      });

      try {
        setImages((await adminService.productImages(id)) || []);
      } catch {
        // Gallery endpoint not available yet; fall back to the single image.
        setImages(
          product.image_url
            ? [{ id: "legacy", url: product.image_url, is_primary: true }]
            : [],
        );
      }
    } catch (err) {
      setLoadError(err?.response?.data?.message || "Could not load this product.");
    } finally {
      setLoading(false);
    }
  }, [id, isEdit]);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    else if (form.name.trim().length > 200) next.name = "Maximum 200 characters.";

    const price = Number(form.price);
    if (form.price === "") next.price = "Price is required.";
    else if (Number.isNaN(price)) next.price = "Price must be a number.";
    else if (price <= 0) next.price = "Price must be greater than 0.";

    const stock = Number(form.stock);
    if (form.stock === "") next.stock = "Stock is required.";
    else if (!Number.isInteger(stock)) next.stock = "Stock must be a whole number.";
    else if (stock < 0) next.stock = "Stock cannot be negative.";

    if (!form.category_id) next.category_id = "Pick a category.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const addPending = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    if (files.length + pending.length > MAX_FILES) {
      setSaveError(`A product can have at most ${MAX_FILES} images.`);
      return;
    }
    const badType = files.find((file) => !ALLOWED_TYPES.includes(file.type));
    if (badType) {
      setSaveError(`${badType.name}: only JPEG, PNG, WebP and AVIF are allowed.`);
      return;
    }
    const tooBig = files.find((file) => file.size > MAX_IMAGE_BYTES);
    if (tooBig) {
      setSaveError(`${tooBig.name} is larger than 5 MB.`);
      return;
    }
    setSaveError("");
    setPending((current) => [
      ...current,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  };

  const removePending = (index) =>
    setPending((current) => current.filter((_item, position) => position !== index));

  const submit = async (event) => {
    event.preventDefault();
    setSaveError("");
    if (!validate()) return;

    setSaving(true);
    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: Number(form.category_id),
      brand_id: form.brand_id ? Number(form.brand_id) : undefined,
    };

    try {
      if (isEdit) {
        await adminService.updateProduct(id, body);
        setToast("Product saved");
      } else {
        const created = await adminService.createProduct(body);
        const newId = created?.product_id;
        if (newId && pending.length > 0) {
          await adminService.uploadProductImages(
            newId,
            pending.map((entry) => entry.file),
          );
        }
        setToast("Product created");
      }
      navigate("/admin/products");
    } catch (err) {
      setSaveError(
        err?.response?.data?.message ||
          "Saving failed. Check the fields and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box>
        <PageHeader title="Product" />
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={load}>
              Retry
            </Button>
          }
        >
          {loadError}
        </Alert>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <PageHeader
        title={isEdit ? `Edit product #${id}` : "New product"}
        subtitle={
          isEdit
            ? "Changes go live on the storefront immediately."
            : "A category is required or the product will not appear under any filter."
        }
        actions={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/products")}>
            Back
          </Button>
        }
      />

      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError("")}>
          {saveError}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 380px" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Details
          </Typography>
          <Box sx={{ display: "grid", gap: 2 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={setField("name")}
              error={Boolean(errors.name)}
              helperText={errors.name || `${form.name.length}/200`}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={setField("description")}
              multiline
              minRows={6}
              fullWidth
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Price"
                value={form.price}
                onChange={setField("price")}
                error={Boolean(errors.price)}
                helperText={errors.price}
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                required
              />
              <TextField
                label="Stock"
                value={form.stock}
                onChange={setField("stock")}
                error={Boolean(errors.stock)}
                helperText={errors.stock}
                type="number"
                inputProps={{ step: "1", min: "0" }}
                required
              />
              <TextField
                select
                label="Category"
                value={form.category_id}
                onChange={setField("category_id")}
                error={Boolean(errors.category_id)}
                helperText={errors.category_id}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category.category_id} value={String(category.category_id)}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              select
              label="Brand"
              value={form.brand_id}
              onChange={setField("brand_id")}
              helperText={
                brands.length === 0
                  ? "No brands yet — create them in Admin → Brands."
                  : "Optional."
              }
              sx={{ maxWidth: 280 }}
            >
              <MenuItem value="">No brand</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand.brand_id} value={String(brand.brand_id)}>
                  {brand.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
            </Button>
            <Button onClick={() => navigate("/admin/products")} disabled={saving}>
              Cancel
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Images
          </Typography>

          {isEdit ? (
            <ImageGallery productId={id} images={images} onChange={setImages} />
          ) : (
            <>
              <Box
                onClick={() => document.getElementById("new-product-images")?.click()}
                sx={{
                  p: 2.5,
                  mb: 2,
                  borderRadius: 2,
                  border: "2px dashed",
                  borderColor: "divider",
                  bgcolor: "#fafafa",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <CloudUploadOutlinedIcon sx={{ color: "text.secondary" }} />
                <Typography sx={{ fontSize: 13.5, fontWeight: 600, mt: 0.5 }}>
                  Choose images
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Up to {MAX_FILES} · uploaded as soon as the product is created
                </Typography>
                <input
                  id="new-product-images"
                  hidden
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(event) => {
                    addPending(event.target.files);
                    event.target.value = "";
                  }}
                />
              </Box>

              {pending.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
                    gap: 1.25,
                  }}
                >
                  {pending.map((entry, index) => (
                    <Box
                      key={entry.preview}
                      sx={{
                        position: "relative",
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "2px solid",
                        borderColor: index === 0 ? "primary.main" : "divider",
                        aspectRatio: "1 / 1",
                      }}
                    >
                      <img
                        src={entry.preview}
                        alt={`Selected ${index + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {index === 0 && (
                        <Chip
                          size="small"
                          color="primary"
                          label="Primary"
                          sx={{
                            position: "absolute",
                            top: 4,
                            left: 4,
                            height: 20,
                            fontSize: 10,
                          }}
                        />
                      )}
                      <IconButton
                        size="small"
                        onClick={() => removePending(index)}
                        sx={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          bgcolor: "rgba(0,0,0,.55)",
                          color: "#fff",
                          "&:hover": { bgcolor: "rgba(0,0,0,.75)" },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>

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
