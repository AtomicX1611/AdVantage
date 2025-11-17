import React, { useState } from "react";
import styles from "../styles/productdetails.module.css";

const ImageGallery = ({ images }) => {
  const [bigImage, setBigImage] = useState(images[0]);

  return (
    <div className={styles.image_container}>
      <div className={styles.card_list}>
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`Thumbnail ${idx}`}
            className={styles.card_container}
            onMouseOver={() => setBigImage(img)}
          />
        ))}
      </div>
      <img src={bigImage} alt="Main" className={styles.big_card} />
    </div>
  );
};

export default ImageGallery;
