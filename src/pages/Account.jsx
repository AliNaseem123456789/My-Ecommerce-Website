import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../components/context/AuthContext";
import { orderService } from "../services/orders.service";
import Sidebar from "../components/Accountx/Sidebar";
import DashboardTab from "../components/Accountx/DashboardTab";
import OrdersTab from "../components/Accountx/OrdersTab";
import DownloadsTab from "../components/Accountx/DownloadsTab";
import AddressesTab from "../components/Accountx/AddressesTab";
import AccountDetailsTab from "../components/Accountx/AccountDetailsTab";
import CompareTab from "../components/Accountx/CompareTab";
import WishlistTab from "../components/Accountx/WishlistTab";

export default function Account() {
  const { user, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const loadOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const data = await orderService.getUserOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Load orders automatically if the active tab is "Orders"
  useEffect(() => {
    if (activeTab.toLowerCase().trim() === "orders") {
      loadOrders();
    }
  }, [activeTab]);

  const renderTab = () => {
    const key = activeTab.toLowerCase().trim();

    switch (key) {
      case "dashboard":
        return <DashboardTab />;
      case "orders":
        return (
          <OrdersTab
            orders={orders}
            loading={loadingOrders}
            loadOrders={loadOrders}
          />
        );
      case "downloads":
        return <DownloadsTab />;
      case "addresses":
      case "address":
        return <AddressesTab />;
      case "account details":
      case "accountdetails":
      case "account-details":
        return <AccountDetailsTab />;
      case "compare":
        return <CompareTab />;
      case "wishlist":
        return <WishlistTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "80vh", background: "#fff" }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logout={logout}
        user={user}
      />
      <div style={{ flex: 1, padding: "40px 50px" }}>{renderTab()}</div>
    </div>
  );
}
