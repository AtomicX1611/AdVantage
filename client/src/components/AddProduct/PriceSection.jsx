import React from "react";
import styles from "../../styles/Addproductform.module.css";

const PriceSection = ({ formData, handleChange, handleSubmit }) => {
  return (
    <div className={`${styles.griditem} ${styles.div4}`}>
      <h3 className={styles.flexitem}>Is it Rental product</h3>
      <input
        type="checkbox"
        className={styles.flexitem}
        name="isRental"
        id="isRental"
        checked={formData.isRental}
        onChange={handleChange}
      />

      <h3 className={styles.flexitem}>Price and Submit</h3>
      <label className={styles.flexitem} htmlFor="price" id="labelForPrice">
        {formData.isRental ? "Per day" : "Sell Price"}
      </label>

      <input
        type="number"
        name="price"
        className={styles.flexitem}
        placeholder="Price"
        id="price"
        value={formData.price}
        onChange={handleChange}
        required
      />{" "}
      Rs

      <button id="submit-form" onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default PriceSection;
