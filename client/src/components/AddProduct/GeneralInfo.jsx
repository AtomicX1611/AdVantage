import React from "react";
import styles from "../../styles/Addproductform.module.css";

const GeneralInfo = ({ formData, handleChange }) => {
  return (
    <div className={`${styles.griditem} ${styles.div1}`}>
      <h3 className={styles.flexitem}>General Information</h3>

      <label htmlFor="Name" className={styles.flexitem}>Product Name</label>
      <input
        type="text"
        name="name"
        id="Name"
        className={styles.flexitem}
        placeholder="Your product name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <label htmlFor="Description" className={styles.flexitem}>Product Description</label>
      <textarea
        name="description"
        id="Description"
        className={styles.flexitem}
        placeholder="Describe your product here.."
        value={formData.description}
        onChange={handleChange}
      ></textarea>

      <div className={`${styles.parentd} ${styles.flexitem}`}>
        <div className={styles.div4d}>
          <label htmlFor="category">Choose Category</label>
          <select
            name="category"
            id="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="default">Select Product Category</option>
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
    </div>
  );
};

export default GeneralInfo;
