import React, { useState } from "react";
import { orderService } from "../services/orders.service";

const STEPS = [
  { key: "pending", label: "Pending", at: "created_at" },
  { key: "paid", label: "Paid", at: "paid_at" },
  { key: "shipped", label: "Shipped", at: "shipped_at" },
  { key: "delivered", label: "Delivered", at: "delivered_at" },
];

function Timeline({ order }) {
  if (order.status === "cancelled") {
    return (
      <p>
        Cancelled
        {order.cancelled_at
          ? ` on ${new Date(order.cancelled_at).toLocaleString()}`
          : ""}
      </p>
    );
  }
  const current = STEPS.findIndex((step) => step.key === (order.status || "pending"));
  return (
    <ol style={{ display: "flex", gap: 16, listStyle: "none", padding: 0, flexWrap: "wrap" }}>
      {STEPS.map((step, index) => {
        const done = current >= index;
        return (
          <li key={step.key} style={{ opacity: done ? 1 : 0.45 }}>
            <strong>{step.label}</strong>
            <div>
              {order[step.at]
                ? new Date(order[step.at]).toLocaleString()
                : done
                  ? "Done"
                  : "Waiting"}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const data = await orderService.track(orderId.trim(), email.trim());
      setOrder(data);
    } catch (err) {
      const message = err.response?.data?.message;
      setError(Array.isArray(message) ? message.join(", ") : message || "Order not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: "0 16px" }}>
      <h1>Track an order</h1>
      <form onSubmit={lookup} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <input
          value={orderId}
          onChange={(event) => setOrderId(event.target.value)}
          placeholder="Order number"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email on the order"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Looking up..." : "Track"}
        </button>
      </form>
      {error ? <p>{error}</p> : null}
      {order ? (
        <div style={{ marginTop: 24 }}>
          <p>Order {order.order_id}</p>
          <Timeline order={order} />
          {order.tracking_number ? (
            <p>
              {order.carrier || "Carrier"} · {order.tracking_number}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
