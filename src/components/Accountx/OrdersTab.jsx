import React, { useEffect } from "react";

export default function OrdersTab({ orders, loading, loadOrders }) {
  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: "25px", fontSize: "26px", fontWeight: "700" }}>
        Your Orders
      </h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.order_id}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: "12px",
              padding: "25px",
              marginBottom: "25px",
              background: "#fff",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            }}
          >
            <h3>Order #{order.order_id}</h3>
            <p>Total: ${order.total}</p>

            <h4 style={{ marginTop: "20px" }}>Items</h4>
            {order.order_items.map((item, i) => (
              <p key={i}>
                {item.products?.name} — {item.quantity} × ${item.price}
              </p>
            ))}

            <h4 style={{ marginTop: "20px" }}>Shipping Address</h4>
            {order.shipping_address ? (
              <p>
                {order.shipping_address.first_name}{" "}
                {order.shipping_address.last_name},<br />
                {order.shipping_address.street},<br />
                {order.shipping_address.city},{" "}
                {order.shipping_address.state},{" "}
                {order.shipping_address.postal_code}
              </p>
            ) : (
              <p>No address available.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
