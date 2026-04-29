import React, { useEffect } from "react";

export default function OrdersTab({ orders, loading, loadOrders }) {
  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div>
        <h2
          style={{ marginBottom: "25px", fontSize: "26px", fontWeight: "700" }}
        >
          Your Orders
        </h2>
        <p>You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: "25px", fontSize: "26px", fontWeight: "700" }}>
        Your Orders
      </h2>

      {orders.map((order) => {
        const address = order.shipping_address?.[0] || {};
        return (
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 5px 0" }}>
                  Order #{order.order_id?.slice(0, 8)}
                </h3>
                <p style={{ color: "#666", margin: "0 0 10px 0" }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    margin: "0",
                    color: "#e60023",
                  }}
                >
                  ${order.total?.toFixed(2)}
                </p>
              </div>
            </div>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Items</h4>
            {order.order_items && order.order_items.length > 0 ? (
              order.order_items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom:
                      i < order.order_items.length - 1
                        ? "1px solid #eee"
                        : "none",
                  }}
                >
                  <span>
                    {item.products?.name || `Product #${item.product_id}`} ×{" "}
                    {item.quantity}
                  </span>
                  <span style={{ fontWeight: "bold" }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p>No items found</p>
            )}

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>
              Shipping Address
            </h4>
            {address?.street ? (
              <div
                style={{
                  background: "#f9fafb",
                  padding: "15px",
                  borderRadius: "8px",
                  lineHeight: "1.5",
                }}
              >
                <p style={{ margin: "0" }}>
                  <strong>
                    {address.first_name} {address.last_name}
                  </strong>
                  <br />
                  {address.street}
                  <br />
                  {address.apartment && (
                    <>
                      {address.apartment}
                      <br />
                    </>
                  )}
                  {address.city}, {address.state} {address.postal_code}
                  <br />
                  {address.email && (
                    <>
                      Email: {address.email}
                      <br />
                    </>
                  )}
                  {address.phone && <>Phone: {address.phone}</>}
                </p>
              </div>
            ) : (
              <p style={{ color: "#999" }}>No shipping address available</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
