import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { orderService } from "../services/orders.service";

function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    orderService
      .getOrder(id)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "This order could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p style={{ padding: 24 }}>Loading order...</p>;
  if (error || !order) {
    return <p style={{ padding: 24 }}>{error || "Order not found."}</p>;
  }

  const address = order.shipping_address?.[0] || {};

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: "0 16px" }}>
      <h1>Order #{order.order_id}</h1>
      <p>Status: {order.status || "pending"}</p>
      <p>Payment: {order.payment_status || "unpaid"}</p>

      <h2>Items</h2>
      {(order.order_items || []).map((item) => (
        <div
          key={item.item_id || `${item.product_name}-${item.quantity}`}
          style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}
        >
          <span>
            {item.product_name || item.products?.name || "Item"} × {item.quantity}
          </span>
          <span>${money(Number(item.price) * Number(item.quantity))}</span>
        </div>
      ))}

      <h2>Totals</h2>
      <p>Subtotal: ${money(order.subtotal)}</p>
      <p>Shipping: ${money(order.shipping)}</p>
      <p>Tax: ${money(order.tax)}</p>
      <p>Total: ${money(order.total)}</p>

      <h2>Shipping address</h2>
      <p>
        {address.first_name} {address.last_name}
        <br />
        {address.street}
        {address.apartment ? `, ${address.apartment}` : ""}
        <br />
        {address.city} {address.state} {address.postal_code}
      </p>

      <Link to="/account">Back to account</Link>
    </div>
  );
}
