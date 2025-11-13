import React from "react";
import styles from "../../styles/Addproductform.module.css";

const AddressSection = ({ formData, handleChange }) => {
  return (
    <div className={`${styles.griditem} ${styles.div2}`}>
      <h3 style={{ marginLeft: "1vw", fontSize: "25px", fontWeight: 400 }}>
        Your Address
      </h3>

      <select
        name="state"
        id="State"
        className={styles.flexitem}
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

      <input
        type="text"
        name="district"
        id="District"
        className={styles.flexitem}
        placeholder="District"
        value={formData.district}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="city"
        id="City"
        className={styles.flexitem}
        placeholder="City"
        value={formData.city}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        id="zipcode"
        name="zipCode"
        className={styles.flexitem}
        placeholder="Zipcode"
        value={formData.zipCode}
        onChange={handleChange}
        required
      />
    </div>
  );
};

export default AddressSection;
