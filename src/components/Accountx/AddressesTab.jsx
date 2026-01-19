import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { addressService } from "../../services/addresses.service";
import "../../styles/AddressesTab.css";
export default function AddressesTab() {
  const { user } = useContext(AuthContext);
  const [billing, setBilling] = useState(null);
  const [shipping, setShipping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formType, setFormType] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const loadAddresses = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await addressService.fetchAddresses(user.id);
      setBilling(data.find((a) => a.type === "billing") || null);
      setShipping(data.find((a) => a.type === "shipping") || null);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const startEditing = (type) => {
    setFormType(type);
    const existing = type === "billing" ? billing : shipping;
    setFormData(
      existing || {
        first_name: "",
        last_name: "",
        company: "",
        country: "",
        street: "",
        apartment: "",
        city: "",
        state: "",
        postal_code: "",
        phone: "",
        email: user?.email || "",
      },
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      setIsSaving(true);
      await addressService.saveAddress(user.id, formType, formData);
      setFormType(null);
      await loadAddresses();
    } catch (err) {
      alert("Failed to save address.");
    } finally {
      setIsSaving(false);
    }
  };

  const AddressCard = ({ title, data, type }) => {
    const isEditing = formType === type;
    return (
      <div className="address-card">
        <div className="card-header">
          <h2 className="card-title">{title}</h2>
          {!isEditing && (
            <button onClick={() => startEditing(type)} className="edit-btn">
              ✏️
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="form-container">
            <div className="address-grid">
              {Object.keys(formData).map((key) => (
                <div key={key} className="input-group">
                  <label className="input-label">{key.replace("_", " ")}</label>
                  <input
                    className="address-input"
                    value={formData[key] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="btn-row">
              <button onClick={() => setFormType(null)} className="cancel-btn">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="save-btn"
              >
                {isSaving ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        ) : (
          <div className="view-mode">
            {data ? (
              <>
                <p>
                  <strong>
                    {data.first_name} {data.last_name}
                  </strong>
                </p>
                <p>
                  {data.street}
                  {data.apartment ? `, ${data.apartment}` : ""}
                </p>
                <p>
                  {data.city}, {data.state} {data.postal_code}
                </p>
                <p>{data.country}</p>
                <p className="address-meta">
                  {data.phone} | {data.email}
                </p>
              </>
            ) : (
              <p className="no-address">No address provided.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <p className="addresses-wrapper">Loading...</p>;

  return (
    <div className="addresses-wrapper">
      <div className="addresses-container">
        {(!formType || formType === "billing") && (
          <AddressCard title="Billing Address" data={billing} type="billing" />
        )}
        {(!formType || formType === "shipping") && (
          <AddressCard
            title="Shipping Address"
            data={shipping}
            type="shipping"
          />
        )}
      </div>
    </div>
  );
}
