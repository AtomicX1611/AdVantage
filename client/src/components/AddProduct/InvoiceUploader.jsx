import React, { useState } from "react";
import styles from "../../styles/Addproductform.module.css";

const InvoiceUploader = ({ handleInvoiceChange }) => {
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    handleInvoiceChange(selected); // LIFT TO PARENT
  };

  return (
    <div className={`${styles.griditem} ${styles.div5}`}>
      <label htmlFor="proof" style={{ fontSize: "xx-large" }} id="labelForProof">+</label>
      <input
        type="file"
        id="proof"
        name="invoice"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <div id="demoName">
        {file && (
          <a href={URL.createObjectURL(file)} target="_blank" rel="noreferrer">
            {file.name}
          </a>
        )}
      </div>
    </div>
  );
};

export default InvoiceUploader;
