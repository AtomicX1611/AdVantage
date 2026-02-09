import React, { useState } from "react";
import styles from "../../styles/Addproductform.module.css";

const ImageUploader = ({ handleFileChange }) => {
  const [previewImages, setPreviewImages] = useState([]);

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
    handleFileChange(e);
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Product Images</h2>

      <label htmlFor="productImages" className={styles.uploadArea}>
        <div className={styles.uploadIcon}>📷</div>
        <p className={styles.uploadText}>Click to upload images</p>
        <p className={styles.uploadSubtext}>PNG, JPG up to 5MB each</p>
      </label>
      <input
        type="file"
        id="productImages"
        name="productImages"
        className={styles.hiddenInput}
        multiple
        accept="image/*"
        onChange={handleChange}
      />

      {previewImages.length > 0 && (
        <div className={styles.imagePreview}>
          {previewImages.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Preview ${idx + 1}`}
              className={styles.previewImage}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
