import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { adminService } from "../../services/admin.service";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 6;

export default function ImageGallery({ productId, images, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const rows = images || [];

  const run = async (work) => {
    setBusy(true);
    setError("");
    try {
      const next = await work();
      onChange(next);
    } catch (err) {
      setError(
        err?.response?.data?.message || "That did not work. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    if (files.length + rows.length > MAX_FILES) {
      setError(`A product can have at most ${MAX_FILES} images.`);
      return;
    }
    const badType = files.find((file) => !ALLOWED.includes(file.type));
    if (badType) {
      setError(`${badType.name}: only JPEG, PNG, WebP and AVIF are allowed.`);
      return;
    }
    const tooBig = files.find((file) => file.size > MAX_BYTES);
    if (tooBig) {
      setError(`${tooBig.name} is larger than 5 MB.`);
      return;
    }

    run(() => adminService.uploadProductImages(productId, files));
  };

  const move = (index, delta) => {
    const next = [...rows];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    run(() =>
      adminService.reorderProductImages(
        productId,
        next.map((row) => row.id),
      ),
    );
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        onClick={() => !busy && inputRef.current?.click()}
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 2,
          border: "2px dashed",
          borderColor: dragging ? "primary.main" : "divider",
          bgcolor: dragging ? "#eff6ff" : "#fafafa",
          textAlign: "center",
          cursor: busy ? "default" : "pointer",
          transition: "background-color .15s ease, border-color .15s ease",
        }}
      >
        {busy ? (
          <CircularProgress size={26} />
        ) : (
          <>
            <CloudUploadOutlinedIcon sx={{ color: "text.secondary" }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 600, mt: 0.5 }}>
              Drop images here, or click to choose
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              Up to {MAX_FILES} per product · JPEG, PNG, WebP, AVIF · max 5 MB each
              {rows.length > 0 && ` · ${rows.length} uploaded`}
            </Typography>
          </>
        )}
        <input
          ref={inputRef}
          hidden
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </Box>

      {rows.length === 0 ? (
        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
          No images yet. The first one you upload becomes the primary image shown
          on cards, in the cart and on the wishlist.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
            gap: 1.25,
          }}
        >
          {rows.map((image, index) => (
            <Box
              key={image.id}
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                border: "2px solid",
                borderColor: image.is_primary ? "primary.main" : "divider",
                aspectRatio: "1 / 1",
                bgcolor: "#f3f4f6",
                "&:hover .gallery-actions": { opacity: 1 },
              }}
            >
              <img
                src={image.url}
                alt={`Product image ${index + 1}`}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />

              {image.is_primary && (
                <Chip
                  size="small"
                  color="primary"
                  label="Primary"
                  sx={{ position: "absolute", top: 4, left: 4, height: 20, fontSize: 10 }}
                />
              )}

              <Box
                className="gallery-actions"
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  gap: 0.25,
                  p: 0.5,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,.62), rgba(0,0,0,0) 55%)",
                  opacity: 0,
                  transition: "opacity .15s ease",
                }}
              >
                <Tooltip title="Move left">
                  <span>
                    <IconButton
                      size="small"
                      disabled={busy || index === 0}
                      onClick={() => move(index, -1)}
                      sx={{ color: "#fff" }}
                    >
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={image.is_primary ? "Primary image" : "Set as primary"}>
                  <span>
                    <IconButton
                      size="small"
                      disabled={busy || image.is_primary}
                      onClick={() =>
                        run(() =>
                          adminService.setPrimaryProductImage(productId, image.id),
                        )
                      }
                      sx={{ color: "#fff" }}
                    >
                      {image.is_primary ? (
                        <StarIcon fontSize="small" />
                      ) : (
                        <StarBorderIcon fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Delete">
                  <span>
                    <IconButton
                      size="small"
                      disabled={busy}
                      onClick={() =>
                        run(() =>
                          adminService.deleteProductImage(productId, image.id),
                        )
                      }
                      sx={{ color: "#fff" }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Move right">
                  <span>
                    <IconButton
                      size="small"
                      disabled={busy || index === rows.length - 1}
                      onClick={() => move(index, 1)}
                      sx={{ color: "#fff" }}
                    >
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {rows.length > 0 && (
        <Button
          size="small"
          sx={{ mt: 1 }}
          disabled={busy || rows.length >= MAX_FILES}
          onClick={() => inputRef.current?.click()}
        >
          Add more
        </Button>
      )}
    </Box>
  );
}
