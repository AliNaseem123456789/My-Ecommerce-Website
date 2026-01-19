import React from "react";
import "../../styles/SideBar.css";

export default function Sidebar({ activeTab, setActiveTab, logout, user }) {
  const tabs = [
    "Dashboard",
    "Orders",
    "Downloads",
    "Addresses",
    "Account details",
    "Compare",
    "Wishlist",
  ];

  return (
    <div className="sidebar-container">
      <div className="profile-section">
        <div className="profile-avatar"></div>
        <p className="profile-name">{user?.user_metadata?.name || "User"}</p>
      </div>
      <div className="sidebar-menu">
        {tabs.map((item) => (
          <div
            key={item}
            onClick={() => setActiveTab(item)}
            className={`sidebar-tab ${activeTab === item ? "active" : ""}`}
          >
            {item}
          </div>
        ))}
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
