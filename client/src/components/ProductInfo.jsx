import React from "react";
import styles from "../styles/productdetails.module.css";

const ProductInfo = ({ product }) => {
  return (
    <div className={styles.details_header}>
      <div className={styles.item_header}>
        <h2 className={styles.item_headertitle}>{product.name}</h2>
        <h2 className={styles.item_price}>
          ₹{product.price}
          {product.isRental ? "/- per day" : "/-"}
        </h2>
      </div>

      <div className={styles.item_location}>
        <h2 style={{ fontWeight: 500, fontSize: "1.7rem" }}>Address:</h2>
        <h2 className={styles.item_address}>{product.address.state}</h2>
        <h3 className={styles.item_address}>{product.address.district}</h3>
        <h4 className={styles.item_address}>{product.address.city}</h4>
      </div>

      {product.verified && (
        <h4 id={styles.verified} style={{ textAlign: "right", width: "100%" }}>
          ✅ Verified Product
        </h4>
      )}
    </div>
  );
};

export default ProductInfo;
