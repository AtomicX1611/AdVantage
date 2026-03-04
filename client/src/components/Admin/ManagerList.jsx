import React, { useState } from "react";
import styles from "../../styles/admin.module.css";
import API_CONFIG from "../../config/api.config";

export default function ManagerList({ managers, onManagerRemoved, onManagerAdded }) {
  const [loading, setLoading] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", category: "" });
  const [formError, setFormError] = useState("");

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

  const handleAddManager = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.email || !formData.password || !formData.category) {
      setFormError("Email, password, and category are required");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    setAddLoading(true);

    try {
      const url = `${API_CONFIG.BACKEND_URL}/${API_CONFIG.API_ENDPOINTS.ADMIN_ADD_MANAGER}`;
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Manager "${formData.email}" has been added successfully`);
        setFormData({ email: "", password: "", category: "" });
        setShowAddForm(false);
        if (onManagerAdded) {
          onManagerAdded(data.manager);
        }
      } else {
        setFormError(data.message || "Failed to add manager");
      }
    } catch (error) {
      console.error("Error adding manager:", error);
      setFormError("Error adding manager");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className={styles.userListBox}>
      <div className={styles.managerListHeader}>
        <h3>All Managers ({managers?.length || 0})</h3>
        <button 
          className={styles.addManagerBtn}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <i className={`bx ${showAddForm ? 'bx-x' : 'bx-plus'}`}></i>
          {showAddForm ? 'Cancel' : 'Add Manager'}
        </button>
      </div>

      {showAddForm && (
        <div className={styles.addManagerForm}>
          <form onSubmit={handleAddManager}>
            <div className={styles.addManagerFormRow}>
              <div className={styles.addManagerInputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="manager@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className={styles.addManagerInputGroup}>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className={styles.addManagerInputGroup}>
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #ddd", fontSize: "0.9rem" }}
                >
                  <option value="">Select Category</option>
                  <option value="Clothes">Clothes</option>
                  <option value="Mobiles">Mobiles</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Books">Books</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Automobiles">Automobiles</option>
                  <option value="Sports">Sports</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Musical Instruments">Musical Instruments</option>
                </select>
              </div>
              <button 
                type="submit" 
                className={styles.submitManagerBtn}
                disabled={addLoading}
              >
                {addLoading ? 'Adding...' : 'Add'}
              </button>
            </div>
            {formError && <p className={styles.formErrorText}>{formError}</p>}
          </form>
        </div>
      )}

      {!managers || managers.length === 0 ? (
        <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
          No managers found
        </p>
      ) : (
        <div className={styles.userListContainer}>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Manager ID</th>
                <th>Email</th>
                <th>Category</th>
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
                  <td>{manager.category || "N/A"}</td>
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
      )}
    </div>
  );
}
