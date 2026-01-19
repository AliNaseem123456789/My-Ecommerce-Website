import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../components/context/AuthContext";
import { CartContext } from "../components/context/CartContext";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Button } from "@mui/material";
import Swal from "sweetalert2";

import CheckoutDeliver from "../components/Checkout/CheckoutDeliver";
import CheckoutShipping from "../components/Checkout/CheckoutShipping";
import CheckoutPayment from "../components/Checkout/CheckoutPayment";
import CheckoutSummary from "../components/Checkout/CheckoutSummary";
import CheckoutPromo from "../components/Checkout/CheckoutPromo";

import { orderService } from "../services/orders.service";

import paypal from "../assets/Logos/Paypal.jpeg";
import karna from "../assets/Logos/karna.jpeg";
import afterpay from "../assets/Logos/afterpay.jpeg";
import venmo from "../assets/Logos/VENMO.png";

export default function Checkout() {
  const { user } = useContext(AuthContext);
  const { cartItems, clearCart } = useContext(CartContext);
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

  const [shippingMethod, setShippingMethod] = useState({
    id: "standard",
    title: "Standard Shipping",
    price: 6.95,
    eta: "Delivery By Thu, Dec 11",
  });

  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [card, setCard] = useState({
    name_on_card: "",
    number: "",
    expiry: "",
    cvc: "",
  });

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    if (user?.email) {
      setForm((f) => ({ ...f, email: user.email }));
    }
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0,
  );

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

  const placeOrder = async () => {

    if (!user?.id) return showLoginAlert();
    if (cartItems.length === 0) {
      return Swal.fire(
        "Empty Cart",
        "Add some items before checking out.",
        "info",
      );
    }

    setLoading(true);

    const shippingPrice = shippingMethod?.price || 0;
    const totalAmount = subtotal + shippingPrice;

    const orderPayload = {
      userId: user.id,
      subtotal: subtotal,
      shipping: shippingPrice,
      total: totalAmount,
      form: form,
      items: cartItems,
    };

    try {

      const response = await orderService.placeOrder(orderPayload);

      const orderData = response.data || response;

      setOrderSuccess(orderData.order_id);

      await Swal.fire({
        title: "Order Placed!",
        text: `Your order #${orderData.order_id} has been successfully created.`,
        icon: "success",
        confirmButtonColor: "#000",
      });

      clearCart();
      navigate("/account");
    } catch (error) {
      console.error("Checkout process failed:", error);
      Swal.fire({
        title: "Checkout Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong while processing your order.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

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
    setActiveStep(2);
  };

  const savePayment = () => {
    if (
      paymentMethod === "card" &&
      (!card.number || !card.name_on_card || !card.cvc)
    ) {
      return Swal.fire(
        "Card Error",
        "Please enter valid credit card details.",
        "error",
      );
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
        {}
        <Grid item xs={12} md={8}>
          <CheckoutDeliver
            form={form}
            handleChange={handleChange}
            completed={completed}
            activeStep={activeStep}
            saveDeliverContinue={saveDeliverContinue}
            reopenSection={reopenSection}
          />

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
        </Grid>

        {}
        <Grid item xs={12} md={4}>
          <CheckoutSummary
            cartItems={cartItems.map((item) => ({
              ...item,
              image:
                item.products.image_url || `https://via.placeholder.com/80`,
            }))}
            subtotal={subtotal}
            shippingMethod={shippingMethod}
            loading={loading}
            placeOrder={placeOrder}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={placeOrder}
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
              background: "#e60023",
              ":hover": { background: "#c4001d" },
              textTransform: "none",
              borderRadius: "8px",
            }}
          >
            {loading ? "Processing..." : "Place Order"}
          </Button>

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
