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
    <div className={`${styles.griditem} ${styles.div3}`}>
      <div className={styles.parent1}>
        <h3 className={styles.flexitem}>Upload Images</h3>

        <div className={styles.div22}>
          {previewImages.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt="preview"
              style={{
                height: "75px",
                borderRadius: "10px",
                margin: "5px",
              }}
            />
          ))}
        </div>

        <div className={styles.div33}>
          <label htmlFor="image" id="plus">+</label>
          <input
            type="file"
            id="image"
            name="productImages"
            style={{ display: "none" }}
            multiple
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
