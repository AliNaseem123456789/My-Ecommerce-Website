import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../components/context/AuthContext";
import { CartContext } from "../components/context/CartContext";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Button } from "@mui/material";
import Swal from "sweetalert2";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutDeliver from "../components/Checkout/CheckoutDeliver";
import CheckoutShipping from "../components/Checkout/CheckoutShipping";
import CheckoutPayment from "../components/Checkout/CheckoutPayment";
import CheckoutSummary from "../components/Checkout/CheckoutSummary";
import CheckoutPromo from "../components/Checkout/CheckoutPromo";
import StripePaymentForm from "../components/Checkout/StripePaymentForm";
import CheckoutSavedAddresses from "../components/Checkout/CheckoutSavedAdresses";
import { paymentsService } from "../services/payments.service";

import paypal from "../assets/Logos/Paypal.jpeg";
import karna from "../assets/Logos/karna.jpeg";
import afterpay from "../assets/Logos/afterpay.jpeg";
import venmo from "../assets/Logos/VENMO.png";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  const { user } = useContext(AuthContext);
  const { cartItems, userId: cartUserId } = useContext(CartContext);
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({
    deliver: false,
    shipping: false,
    payment: false,
  });

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: user?.email || "",
    phone: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    postal_code: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [card, setCard] = useState({
    name_on_card: "",
    number: "",
    expiry: "",
    cvc: "",
  });

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Stripe specific states
  const [clientSecret, setClientSecret] = useState("");
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [serverTotal, setServerTotal] = useState(null);

  // ✅ Calculate subtotal FIRST
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0,
  );

  // ✅ THEN define shipping options based on subtotal
  const getShippingOptions = () => {
    const standardPrice = subtotal > 100 ? 0 : 6.95;
    return {
      id: "standard",
      title: subtotal > 100 ? "Free Shipping" : "Standard Shipping",
      price: standardPrice,
      eta: "Delivery By Thu, Dec 11",
    };
  };

  const [shippingMethod, setShippingMethod] = useState(getShippingOptions());

  // ✅ Update shipping options when subtotal changes (e.g., cart updates)
  useEffect(() => {
    setShippingMethod(getShippingOptions());
  }, [subtotal]);

  const totalAmount = subtotal + (shippingMethod?.price || 0);

  useEffect(() => {
    if (user?.email) {
      setForm((f) => ({ ...f, email: user.email }));
    }
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const showLoginAlert = () => {
    Swal.fire({
      title: "Login Required",
      text: "Please log in to complete your purchase.",
      icon: "warning",
      confirmButtonText: "Login Now",
      confirmButtonColor: "#000",
    }).then(() => {
      navigate("/login");
    });
  };

  // Setup Stripe Payment Intent
  const setupStripePayment = async () => {
    if (!cartUserId) {
      showLoginAlert();
      return false;
    }

    if (cartItems.length === 0) {
      Swal.fire("Empty Cart", "Add some items before checking out.", "info");
      return false;
    }

    if (!selectedAddressId && !form.street) {
      Swal.fire(
        "Address Required",
        "Select a saved address or enter a delivery address.",
        "info",
      );
      return false;
    }

    setLoading(true);

    try {
      const payload = { userId: cartUserId };
      if (selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        payload.address = {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          street: form.street,
          apartment: form.apartment,
          city: form.city,
          state: form.state,
          postal_code: form.postal_code,
        };
      }
      const response = await paymentsService.createPaymentIntent(payload);
      setClientSecret(response.clientSecret);
      setPendingOrderId(response.orderId);
      setServerTotal(response.total);
      setShowStripeForm(true);
      return true;
    } catch (error) {
      console.error("Failed to setup payment:", error);
      const data = error.response?.data;
      const products = data?.products;
      const message = Array.isArray(data?.message)
        ? data.message.join(", ")
        : data?.message;
      Swal.fire({
        title: "Payment Setup Failed",
        text: products?.length
          ? `Not enough stock: ${products.join(", ")}`
          : message || "Could not initialize payment system. Please try again.",
        icon: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save delivery info and go to shipping step
  const saveDeliverContinue = () => {
    const required = [
      "first_name",
      "last_name",
      "street",
      "city",
      "postal_code",
    ];
    const isMissing = required.some((field) => !form[field]);

    if (isMissing) {
      return Swal.fire(
        "Incomplete Form",
        "Please fill in all required delivery fields.",
        "error",
      );
    }
    setCompleted((c) => ({ ...c, deliver: true }));
    setActiveStep(1); // ✅ Go to shipping step (not 2!)
  };

  // ✅ Save shipping method and go to payment step
  const saveShippingContinue = () => {
    setCompleted((c) => ({ ...c, shipping: true }));
    setActiveStep(2); // ✅ Go to payment step
  };

  // Handle successful Stripe payment
  const handleStripeSuccess = async () => {
    setOrderSuccess(pendingOrderId);
    await Swal.fire({
      title: "Payment Successful!",
      text: `Your order #${pendingOrderId} has been placed successfully.`,
      icon: "success",
      confirmButtonColor: "#000",
    });
    navigate(`/order/${pendingOrderId}`);
  };

  const handleStripeError = (errorMessage) => {
    Swal.fire({
      title: "Payment Failed",
      text: errorMessage,
      icon: "error",
    });
    setShowStripeForm(false);
    setClientSecret("");
  };

  const savePayment = async () => {
    if (paymentMethod === "stripe") {
      await setupStripePayment();
    } else if (paymentMethod === "card") {
      if (!card.number || !card.name_on_card || !card.cvc) {
        return Swal.fire(
          "Card Error",
          "Please enter valid credit card details.",
          "error",
        );
      }
    }
    setCompleted((c) => ({ ...c, payment: true }));
    setActiveStep(-1);
  };

  const reopenSection = (stepIndex) => setActiveStep(stepIndex);

  const logos = { paypal, venmo, klarna: karna, afterpay };

  return (
    <Box
      sx={{
        maxWidth: "1400px",
        margin: "auto",
        padding: "24px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <Grid container spacing={3}>
        {/* Left Column - Forms */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Step 1: Delivery Information */}
          {/* <CheckoutDeliver
            form={form}
            handleChange={handleChange}
            completed={completed}
            activeStep={activeStep}
            saveDeliverContinue={saveDeliverContinue}
            reopenSection={reopenSection}
          /> */}

          {/* Step 2: Shipping Method */}
          <CheckoutShipping
            shippingMethod={shippingMethod}
            setShippingMethod={setShippingMethod}
            completed={completed}
            activeStep={activeStep}
            saveShippingContinue={saveShippingContinue} // ✅ Pass this!
            reopenSection={reopenSection}
            cartItems={cartItems}
          />
          <CheckoutSavedAddresses
            userId={user?.id}
            onAddressSelected={setSelectedAddressId}
            initialFormData={form}
            onFormChange={(updatedForm) => setForm(updatedForm)}
            completed={completed}
            activeStep={activeStep}
            saveDeliverContinue={saveDeliverContinue}
            reopenSection={reopenSection}
          />
          {/* Step 3: Payment Method */}
          <CheckoutPayment
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            card={card}
            setCard={setCard}
            completed={completed}
            activeStep={activeStep}
            savePayment={savePayment}
            reopenSection={reopenSection}
            logos={logos}
          />

          {/* Stripe Payment Form */}
          {showStripeForm && clientSecret && (
            <Box sx={{ mt: 3, p: 3, bgcolor: "white", borderRadius: "8px" }}>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm
                  amount={serverTotal ?? totalAmount}
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                />
              </Elements>
            </Box>
          )}
        </Grid>

        {/* Right Column - Order Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <CheckoutSummary
            cartItems={cartItems.map((item) => ({
              ...item,
              image:
                item.products.image_url || `https://via.placeholder.com/80`,
            }))}
            subtotal={subtotal}
            shippingMethod={shippingMethod}
            loading={loading}
            placeOrder={savePayment}
          />

          {orderSuccess && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "#e8f5e9",
                color: "#2e7d32",
                textAlign: "center",
                borderRadius: "8px",
              }}
            >
              Order placed! Order ID: <strong>{orderSuccess}</strong>
            </Box>
          )}

          <CheckoutPromo />
        </Grid>
      </Grid>
    </Box>
  );
}
