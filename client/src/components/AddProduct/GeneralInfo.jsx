import React from "react";
import styles from "../../styles/Addproductform.module.css";

const GeneralInfo = ({ formData, handleChange }) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>General Information</h2>

      <div className={styles.inputGroup}>
        <label htmlFor="name" className={styles.label}>Product Name</label>
        <input
          type="text"
          name="name"
          id="name"
          className={styles.input}
          placeholder="Enter your product name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="description" className={styles.label}>Product Description</label>
        <textarea
          name="description"
          id="description"
          className={styles.textarea}
          placeholder="Describe your product in detail..."
          value={formData.description}
          onChange={handleChange}
        ></textarea>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="category" className={styles.label}>Category</label>
        <select
          name="category"
          id="category"
          className={styles.select}
          value={formData.category}
          onChange={handleChange}
        >
          <option value="default">Select a category</option>
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
    </div>
  );
};

export default GeneralInfo;
