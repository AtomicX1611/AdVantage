import React, { useState, useEffect } from "react";
import styles from "../styles/complaintmodal.module.css";
import API_CONFIG from "../config/api.config";

const ComplaintModal = ({
  onClose,
  productId,
  productName,
  preSelectedRespondent,
  source, // "product_detail" | "seller_dashboard"
}) => {
  const [type, setType] = useState("product");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [respondentId, setRespondentId] = useState(preSelectedRespondent || "");
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingBuyers, setLoadingBuyers] = useState(false);

  const backendURL = API_CONFIG.BACKEND_URL;

  // Fetch buyers associated with this product (for seller complaints)
  useEffect(() => {
    if (productId && source === "seller_dashboard") {
      fetchBuyers();
    }
  }, [productId, source]);

  const fetchBuyers = async () => {
    setLoadingBuyers(true);
    try {
      const res = await fetch(
        `${backendURL}/user/complaints/buyers/${productId}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (data.success) {
        setBuyers(data.buyers || []);
      }
    } catch (err) {
      console.error("Error fetching buyers:", err);
    } finally {
      setLoadingBuyers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!subject.trim() || !description.trim()) {
      setError("Subject and description are required");
      return;
    }

    if (!productId) {
      setError("Product is required for filing a complaint");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${backendURL}/user/complaint`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          respondentId: respondentId || null,
          type,
          subject: subject.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Complaint filed successfully. It will be reviewed by the category manager.");
        onClose();
      } else {
        setError(data.message || "Failed to file complaint");
      }
    } catch (err) {
      console.error("Error filing complaint:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>File a Complaint</h2>
        <p className={styles.modalSubtitle}>
          Your complaint will be reviewed by the category manager
        </p>

        {productName && (
          <div className={styles.productInfo}>
            <p>
              <strong>Product:</strong> {productName}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Complaint Type</label>
            <select
              className={styles.select}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="product">Product Related</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Show respondent selection */}
          {source === "seller_dashboard" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Complaint Against (Buyer)</label>
              {loadingBuyers ? (
                <p style={{ fontSize: "0.85rem", color: "#888" }}>
                  Loading buyers...
                </p>
              ) : buyers.length > 0 ? (
                <select
                  className={styles.select}
                  value={respondentId}
                  onChange={(e) => setRespondentId(e.target.value)}
                >
                  <option value="">-- Select Buyer (Optional) --</option>
                  {buyers.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.username} ({b.email})
                    </option>
                  ))}
                </select>
              ) : (
                <p style={{ fontSize: "0.85rem", color: "#888" }}>
                  No buyers found for this product
                </p>
              )}
            </div>
          )}

          {source === "product_detail" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Complaint Against (Seller)</label>
              <input
                className={`${styles.input} ${styles.disabledField}`}
                value={preSelectedRespondent ? "Seller (auto-selected)" : "N/A"}
                disabled
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Subject</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Brief summary of your complaint"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              required
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintModal;
