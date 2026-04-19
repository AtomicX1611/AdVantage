import React, { useState } from "react";
import styles from "../styles/bidmodal.module.css";

const BidModal = ({ onClose, onSubmit, productPrice }) => {
  const [bidAmount, setBidAmount] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bidAmount || bidAmount <= 0) {
      alert("Please enter a valid bid amount");
      return;
    }
    if (!address || !city || !pinCode) {
      alert("Please fill out all shipping details.");
      return;
    }
    onSubmit(bidAmount, { address, city, pinCode });
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

          <div className={styles.inputGroup}>
            <label htmlFor="address" className={styles.label}>Shipping Address</label>
            <input
              type="text"
              id="address"
              className={styles.input}
              placeholder="123 Main St"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup} style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="city" className={styles.label}>City</label>
              <input
                type="text"
                id="city"
                className={styles.input}
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="pinCode" className={styles.label}>PIN Code</label>
              <input
                type="text"
                id="pinCode"
                className={styles.input}
                placeholder="PIN Code"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                required
              />
            </div>
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
