import React from "react";
import styles from "../../styles/Addproductform.module.css";

const PriceSection = ({ formData, handleChange, handleSubmit }) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Pricing</h2>

      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          className={styles.checkbox}
          name="isRental"
          id="isRental"
          checked={formData.isRental}
          onChange={handleChange}
        />
        <label htmlFor="isRental" className={styles.checkboxLabel}>
          This is a rental product
        </label>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="price">
          {formData.isRental ? "Price per day" : "Selling Price"}
        </label>
        <div className={styles.priceInputWrapper}>
          <input
            type="number"
            name="price"
            className={styles.input}
            placeholder="Enter price"
            id="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <span className={styles.priceSuffix}>₹</span>
        </div>
      </div>

      <button type="button" className={styles.submitButton} onClick={handleSubmit}>
        Add Product
      </button>
    </div>
  );
};

export default PriceSection;
