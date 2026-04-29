import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import {
  Box,
  Typography,
  Collapse,
  Paper,
  Button,
  Grid,
  TextField,
  IconButton,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import apiClient from "../../api/apiClient";

export default function CheckoutSavedAddresses({
  userId,
  onAddressSelected,
  initialFormData,
  onFormChange,
  completed,
  activeStep,
  saveDeliverContinue,
  reopenSection,
}) {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressType, setAddressType] = useState("shipping");
  const [localForm, setLocalForm] = useState(() => ({
    first_name: initialFormData?.first_name || "",
    last_name: initialFormData?.last_name || "",
    email: initialFormData?.email || "",
    phone: initialFormData?.phone || "",
    company: "",
    country: "Pakistan",
    street: initialFormData?.street || "",
    apartment: initialFormData?.apartment || "",
    city: initialFormData?.city || "",
    state: initialFormData?.state || "",
    postal_code: initialFormData?.postal_code || "",
  }));
  useEffect(() => {
    if (initialFormData && Object.keys(initialFormData).length > 0) {
      setLocalForm((prev) => ({
        ...prev,
        ...initialFormData,
      }));
    }
  }, [
    initialFormData?.first_name,
    initialFormData?.last_name,
    initialFormData?.street,
  ]);
  const fetchAddresses = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/account/addresses/${userId}?type=shipping`,
      );
      setSavedAddresses(response || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAddresses();
    }
  }, [userId, fetchAddresses]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setLocalForm((prev) => {
        const updatedForm = { ...prev, [name]: value };
        if (onFormChange) {
          onFormChange(updatedForm);
        }
        return updatedForm;
      });
    },
    [onFormChange],
  );

  const handleAddressSelect = useCallback(
    (address) => {
      setSelectedAddressId(address.id);
      const selectedForm = {
        first_name: address.first_name || "",
        last_name: address.last_name || "",
        email: address.email || initialFormData?.email || "",
        phone: address.phone || "",
        company: address.company || "",
        country: address.country || "Pakistan",
        street: address.street || "",
        apartment: address.apartment || "",
        city: address.city || "",
        state: address.state || "",
        postal_code: address.postal_code || "",
      };
      setLocalForm(selectedForm);
      if (onFormChange) {
        onFormChange(selectedForm);
      }
    },
    [initialFormData, onFormChange],
  );

  const saveNewAddress = useCallback(async () => {
    const required = [
      "first_name",
      "last_name",
      "street",
      "city",
      "postal_code",
    ];
    const isMissing = required.some((field) => !localForm[field]);

    if (isMissing) {
      await Swal.fire({
        title: "Incomplete Form",
        text: "Please fill in all required fields.",
        icon: "error",
        confirmButtonColor: "#000",
      });
      return;
    }

    try {
      const addressData = {
        user_id: userId,
        type: addressType,
        first_name: localForm.first_name,
        last_name: localForm.last_name,
        email: localForm.email,
        phone: localForm.phone,
        company: localForm.company,
        country: localForm.country,
        street: localForm.street,
        apartment: localForm.apartment,
        city: localForm.city,
        state: localForm.state,
        postal_code: localForm.postal_code,
      };

      const response = await apiClient.post(
        `/account/addresses/${userId}`,
        addressData,
      );
      await fetchAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);

      if (response?.id) {
        handleAddressSelect({ ...addressData, id: response.id });
      }

      await Swal.fire({
        title: "Success!",
        text: "Address saved successfully.",
        icon: "success",
        confirmButtonColor: "#000",
        timer: 1500,
      });
    } catch (error) {
      console.error("Error saving address:", error);
      await Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to save address.",
        icon: "error",
        confirmButtonColor: "#000",
      });
    }
  }, [userId, localForm, fetchAddresses, handleAddressSelect, addressType]);
  const deleteAddress = useCallback(
    async (addressId) => {
      const result = await Swal.fire({
        title: "Delete Address?",
        text: "Are you sure you want to remove this address?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Delete",
      });

      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/account/addresses/${userId}/${addressId}`);
          await fetchAddresses();
          if (selectedAddressId === addressId) {
            setSelectedAddressId(null);
            const emptyForm = {
              first_name: "",
              last_name: "",
              email: initialFormData?.email || "",
              phone: "",
              company: "",
              country: "Pakistan",
              street: "",
              apartment: "",
              city: "",
              state: "",
              postal_code: "",
            };
            setLocalForm(emptyForm);
            if (onFormChange) onFormChange(emptyForm);
          }
          await Swal.fire({
            title: "Deleted!",
            text: "Address has been removed.",
            icon: "success",
            confirmButtonColor: "#000",
            timer: 1500,
          });
        } catch (error) {
          console.error("Error deleting address:", error);
          await Swal.fire({
            title: "Error",
            text: "Failed to delete address.",
            icon: "error",
            confirmButtonColor: "#000",
          });
        }
      }
    },
    [userId, fetchAddresses, selectedAddressId, initialFormData, onFormChange],
  );
  const getAddressIcon = (address) => {
    return <LocationOnIcon sx={{ color: "#e60023" }} />;
  };
  return (
    <Paper elevation={1} sx={{ mb: 2, p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          1. Delivery Address
        </Typography>
        {completed.deliver && (
          <Typography sx={{ color: "green", fontSize: "14px" }}>
            ✓ Saved
          </Typography>
        )}
      </Box>
      <Collapse in={!completed.deliver || activeStep === 0}>
        {(!completed.deliver || activeStep === 0) && (
          <Box sx={{ mt: 2 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : savedAddresses.length > 0 && !showAddressForm ? (
              <>
                <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
                  Select a saved address or add a new one:
                </Typography>
                {savedAddresses.map((address) => (
                  <Paper
                    key={address.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 2,
                      cursor: "pointer",
                      borderColor:
                        selectedAddressId === address.id
                          ? "#e60023"
                          : "#e0e0e0",
                      bgcolor:
                        selectedAddressId === address.id ? "#fff5f5" : "white",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "#e60023",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      },
                    }}
                    onClick={() => handleAddressSelect(address)}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        {getAddressIcon(address)}
                        <Typography sx={{ fontWeight: 600 }}>
                          {address.first_name} {address.last_name}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAddress(address);
                            setLocalForm({
                              first_name: address.first_name || "",
                              last_name: address.last_name || "",
                              email: address.email || "",
                              phone: address.phone || "",
                              company: address.company || "",
                              country: address.country || "Pakistan",
                              street: address.street || "",
                              apartment: address.apartment || "",
                              city: address.city || "",
                              state: address.state || "",
                              postal_code: address.postal_code || "",
                            });
                            setShowAddressForm(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAddress(address.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                      {address.street}
                      {address.apartment && `, ${address.apartment}`}
                      <br />
                      {address.city}, {address.state} {address.postal_code}
                    </Typography>
                    {address.phone && (
                      <Typography
                        variant="caption"
                        sx={{ mt: 1, display: "block", color: "#999" }}
                      >
                        Phone: {address.phone}
                      </Typography>
                    )}
                  </Paper>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setShowAddressForm(true);
                    setEditingAddress(null);
                    setLocalForm({
                      first_name: "",
                      last_name: "",
                      email: initialFormData?.email || "",
                      phone: "",
                      company: "",
                      country: "Pakistan",
                      street: "",
                      apartment: "",
                      city: "",
                      state: "",
                      postal_code: "",
                    });
                  }}
                  sx={{ mt: 1, textTransform: "none" }}
                >
                  Add New Address
                </Button>
              </>
            ) : (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography sx={{ fontWeight: 600, mb: 2 }}>
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </Typography>

                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <RadioGroup
                    row
                    value={addressType}
                    onChange={(e) => setAddressType(e.target.value)}
                  >
                    <FormControlLabel
                      value="shipping"
                      control={<Radio />}
                      label="Shipping Address"
                    />
                    <FormControlLabel
                      value="billing"
                      control={<Radio />}
                      label="Billing Address"
                    />
                  </RadioGroup>
                </FormControl>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="First Name *"
                      name="first_name"
                      value={localForm.first_name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Last Name *"
                      name="last_name"
                      value={localForm.last_name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Company"
                      name="company"
                      value={localForm.company}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Email"
                      name="email"
                      type="email"
                      value={localForm.email}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Phone"
                      name="phone"
                      value={localForm.phone}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Country"
                      name="country"
                      value={localForm.country}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Street Address *"
                      name="street"
                      value={localForm.street}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Apartment, Suite (Optional)"
                      name="apartment"
                      value={localForm.apartment}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="City *"
                      name="city"
                      value={localForm.city}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="State *"
                      name="state"
                      value={localForm.state}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Postal Code *"
                      name="postal_code"
                      value={localForm.postal_code}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={saveNewAddress}
                    sx={{ bgcolor: "black", "&:hover": { bgcolor: "#111" } }}
                  >
                    {editingAddress ? "Update Address" : "Save Address"}
                  </Button>
                </Box>
              </Paper>
            )}

            {!showAddressForm && selectedAddressId && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={saveDeliverContinue}
                  sx={{ bgcolor: "black", "&:hover": { bgcolor: "#111" } }}
                >
                  Continue to Shipping
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Collapse>

      {completed.deliver && activeStep !== 0 && (
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div>
              <Typography sx={{ fontWeight: 600 }}>
                {localForm.first_name} {localForm.last_name}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                {localForm.street}
                {localForm.apartment && `, ${localForm.apartment}`}
                <br />
                {localForm.city}, {localForm.state} {localForm.postal_code}
              </Typography>
            </div>
            <Button
              variant="text"
              onClick={() => reopenSection(0)}
              sx={{ textTransform: "none" }}
            >
              Change
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
