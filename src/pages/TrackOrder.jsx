import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../components/context/AuthContext";
import { orderService } from "../services/orders.service";

export default function TrackOrder() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    orderService
      .getUserOrders(user.id)
      .then((data) => setOrders(data || []))
      .catch(() => setError("Orders could not be loaded."))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p style={{ padding: 24 }}>Loading orders...</p>;
  if (error) return <p style={{ padding: 24 }}>{error}</p>;

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: "0 16px" }}>
      <h1>Track orders</h1>
      {orders.length === 0 && <p>You have no orders yet.</p>}
      {orders.map((order) => (
        <div key={order.order_id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
          <Link to={`/order/${order.order_id}`}>Order {order.order_id}</Link>
          <p>Status: {order.status || "pending"}</p>
          <p>Payment: {order.payment_status || "unpaid"}</p>
          {order.paid_at && <p>Paid: {new Date(order.paid_at).toLocaleString()}</p>}
          {order.shipped_at && <p>Shipped: {new Date(order.shipped_at).toLocaleString()}</p>}
          {order.delivered_at && <p>Delivered: {new Date(order.delivered_at).toLocaleString()}</p>}
          {order.cancelled_at && <p>Cancelled: {new Date(order.cancelled_at).toLocaleString()}</p>}
        </div>
      ))}
    </div>
  );
}
