import React, { useState } from "react";
import styles from "../styles/rentmodal.module.css";

const RentForm = ({ onClose, onSubmit, productPrice }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");

  const calculateDays = () => {
    if (!fromDate || !toDate) return 0;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalPrice = calculateDays() * (pricePerDay || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      alert("Please fill both dates");
      return;
    }
    if (fromDate >= toDate) {
      alert("From date must be earlier than To date");
      return;
    }
    if (!pricePerDay || pricePerDay <= 0) {
      alert("Please enter a valid price per day");
      return;
    }
    onSubmit(fromDate, toDate, pricePerDay);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Rent Request</h2>
        <p className={styles.productPrice}>Product Price: ₹{productPrice}/-</p>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="fromDate" className={styles.label}>
              From Date
            </label>
            <input
              type="date"
              id="fromDate"
              className={styles.input}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="toDate" className={styles.label}>
              To Date
            </label>
            <input
              type="date"
              id="toDate"
              className={styles.input}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="pricePerDay" className={styles.label}>
              Your Offer - Price Per Day (₹)
            </label>
            <input
              type="number"
              id="pricePerDay"
              className={styles.input}
              placeholder="Enter price per day"
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              min="1"
              required
            />
          </div>

          {fromDate && toDate && pricePerDay > 0 && (
            <p className={styles.totalPrice}>
              Total: {calculateDays()} days × ₹{pricePerDay} = ₹{totalPrice}/-
            </p>
          )}

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RentForm;
