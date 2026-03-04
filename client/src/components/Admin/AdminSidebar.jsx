import React from "react";
import "boxicons/css/boxicons.min.css";
import styles from "../../styles/admin.module.css";

const navItems = [
  { id: "overview", label: "Overview", icon: "bx bxs-dashboard" },
  { id: "users", label: "Users", icon: "bx bxs-group" },
  { id: "managers", label: "Managers", icon: "bx bxs-briefcase" },
  { id: "payments", label: "Payments", icon: "bx bxs-credit-card" },
];

export default function AdminSidebar({ activeTab, onTabChange, onLogout }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarLogo}>
          <i className="bx bxs-shield-alt-2"></i>
          <span>AdVantage</span>
        </div>
        <p className={styles.sidebarRole}>Admin Panel</p>
      </div>

      <nav className={styles.sidebarNav}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.sidebarNavItem} ${
              activeTab === item.id ? styles.sidebarNavItemActive : ""
            }`}
            onClick={() => onTabChange(item.id)}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.sidebarLogoutBtn} onClick={onLogout}>
          <i className="bx bx-log-out"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
