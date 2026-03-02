import React, { useState } from "react";
import styles from "../../styles/admin.module.css";
import API_CONFIG from "../../config/api.config";

export default function ManagerList({ managers, onManagerRemoved }) {
  const [loading, setLoading] = useState({});

  const handleRemove = async (managerId, email) => {
    if (!window.confirm(`Are you sure you want to remove manager "${email}"?`)) {
      return;
    }

    setLoading(prev => ({ ...prev, [managerId]: true }));

    try {
      const url = `${API_CONFIG.BACKEND_URL}/admin/removeManager/${managerId}`;
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        alert(`Manager "${email}" has been removed successfully`);
        if (onManagerRemoved) {
          onManagerRemoved(managerId);
        }
      } else {
        alert(data.message || "Failed to remove manager");
      }
    } catch (error) {
      console.error("Error removing manager:", error);
      alert("Error removing manager");
    } finally {
      setLoading(prev => ({ ...prev, [managerId]: false }));
    }
  };

  if (!managers || managers.length === 0) {
    return (
      <div className={styles.userListBox}>
        <h3>All Managers</h3>
        <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
          No managers found
        </p>
      </div>
    );
  }

  return (
    <div className={styles.userListBox}>
      <h3>All Managers ({managers.length})</h3>
      <div className={styles.userListContainer}>
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Manager ID</th>
              <th>Email</th>
              <th>Products Verified</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {managers.map((manager, index) => (
              <tr key={manager._id}>
                <td>{index + 1}</td>
                <td>{manager._id}</td>
                <td>{manager.email}</td>
                <td>{manager.productsVerified ?? 0}</td>
                <td>
                  {manager.createdAt
                    ? new Date(manager.createdAt).toLocaleDateString("en-IN")
                    : "N/A"}
                </td>
                <td>
                  <button
                    className={styles.takeDownBtn}
                    onClick={() => handleRemove(manager._id, manager.email)}
                    disabled={loading[manager._id]}
                  >
                    {loading[manager._id] ? "Removing..." : "Remove"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
