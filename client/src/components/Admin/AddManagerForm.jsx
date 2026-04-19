import React, { useState } from "react";
import styles from "../../styles/admin.module.css";
import API_CONFIG from "../../config/api.config";

export default function AddManagerForm({ onManagerAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const url = `${API_CONFIG.BACKEND_URL}/${API_CONFIG.API_ENDPOINTS.ADMIN_ADD_MANAGER}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setEmail("");
        setPassword("");
        setShowForm(false);
        if (onManagerAdded) onManagerAdded(data.manager);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to add manager" });
      }
    } catch (err) {
      console.error("Error adding manager:", err);
      setMessage({ type: "error", text: "Failed to add manager. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.addManagerSection}>
      {!showForm ? (
        <button className={styles.addManagerBtn} onClick={() => setShowForm(true)}>
          + Add Manager
        </button>
      ) : (
        <div className={styles.addManagerFormBox}>
          <h3>Add New Manager</h3>
          <form onSubmit={handleSubmit} className={styles.addManagerForm}>
            <input
              type="email"
              placeholder="Manager Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.addManagerInput}
            />
            <input
              type="password"
              placeholder="Manager Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.addManagerInput}
            />
            <div className={styles.addManagerActions}>
              <button type="submit" className={styles.addManagerSubmitBtn} disabled={loading}>
                {loading ? "Adding..." : "Add Manager"}
              </button>
              <button
                type="button"
                className={styles.addManagerCancelBtn}
                onClick={() => {
                  setShowForm(false);
                  setEmail("");
                  setPassword("");
                  setMessage(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
          {message && (
            <p className={message.type === "success" ? styles.successMsg : styles.errorMsg}>
              {message.text}
            </p>
          )}
        </div>
      )}
      {!showForm && message && (
        <p className={message.type === "success" ? styles.successMsg : styles.errorMsg}>
          {message.text}
        </p>
      )}
    </div>
  );
}
