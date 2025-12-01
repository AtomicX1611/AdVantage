import React, { useState } from "react";
import styles from "../styles/productdetails.module.css";

const ImageGallery = ({ images }) => {
  const imageList = images && images.length > 0 ? images : ['/Assets/placeholder.png'];
  const [bigImage, setBigImage] = useState(imageList[0]);

  return (
    <div className={styles.image_container}>
      <div className={styles.card_list}>
        {imageList.map((img, idx) => {
          // console.log(img);
          return (
            <img
              key={idx}
              src={import.meta.env.VITE_BACKEND_URL + "/" + img}
              alt={`Thumbnail ${idx}`}
              className={styles.card_container}
              onMouseOver={() => setBigImage(img)}
            />
          );
        })}
      </div>
      <img src={import.meta.env.VITE_BACKEND_URL + "/" + bigImage} alt="Main" className={styles.big_card} />
    </div>
  );
};

export default ImageGallery;
