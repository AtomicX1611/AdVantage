import React from "react";
import styles from "../../styles/Addproductform.module.css";

const AddressSection = ({ formData, handleChange }) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Location Details</h2>

      <div className={styles.inputGroup}>
        <label htmlFor="state" className={styles.label}>State</label>
        <select
          name="state"
          id="state"
          className={styles.select}
          value={formData.state}
          onChange={handleChange}
          required
        >
          <option value="default">Select your state</option>
          {[
            "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
            "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
            "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
            "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
            "Uttarakhand","West Bengal",
          ].map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      <div className={styles.inputRow}>
        <div className={styles.inputGroup}>
          <label htmlFor="district" className={styles.label}>District</label>
          <input
            type="text"
            name="district"
            id="district"
            className={styles.input}
            placeholder="Enter district"
            value={formData.district}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="city" className={styles.label}>City</label>
          <input
            type="text"
            name="city"
            id="city"
            className={styles.input}
            placeholder="Enter city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="zipCode" className={styles.label}>Zip Code</label>
        <input
          type="number"
          id="zipCode"
          name="zipCode"
          className={styles.input}
          placeholder="Enter zip code"
          value={formData.zipCode}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );
};

export default AddressSection;
