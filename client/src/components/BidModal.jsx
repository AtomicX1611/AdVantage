import React, { useState } from "react";
import styles from "../styles/bidmodal.module.css";

const BidModal = ({ onClose, onSubmit, productPrice }) => {
  const [bidAmount, setBidAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bidAmount || bidAmount <= 0) {
      alert("Please enter a valid bid amount");
      return;
    }
    onSubmit(bidAmount);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Place Your Bid</h2>
        <p className={styles.productPrice}>Product Price: ₹{productPrice}/-</p>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="bidAmount" className={styles.label}>
              Your Bid Amount (₹)
            </label>
            <input
              type="number"
              id="bidAmount"
              className={styles.input}
              placeholder="Enter your bid amount"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              min="1"
              required
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Submit Bid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BidModal;
