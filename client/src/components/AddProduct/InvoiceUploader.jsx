import React, { useState } from "react";
import styles from "../../styles/Addproductform.module.css";

const InvoiceUploader = ({ handleInvoiceChange }) => {
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    handleInvoiceChange(selected);
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Invoice / Proof (Optional)</h2>

      <label htmlFor="invoice" className={styles.uploadArea}>
        <div className={styles.uploadIcon}>📄</div>
        <p className={styles.uploadText}>Upload invoice or proof of purchase</p>
        <p className={styles.uploadSubtext}>PDF, PNG, JPG up to 10MB</p>
      </label>
      <input
        type="file"
        id="invoice"
        name="invoice"
        className={styles.hiddenInput}
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleChange}
      />

      {file && (
        <a
          href={URL.createObjectURL(file)}
          target="_blank"
          rel="noreferrer"
          className={styles.fileLink}
        >
          📎 {file.name}
        </a>
      )}
    </div>
  );
};

export default InvoiceUploader;
