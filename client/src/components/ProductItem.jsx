import React from "react";
import styles from "../styles/wishlist.module.css";
import { resolveImageUrl } from "../utils/imageUrl";

export default function ProductItem({ product, addToCompare }) {
  return (
    <div
      className={styles["product-item"]}
      onClick={() => addToCompare(product)}
    >
      <span style={{ position: "absolute", top: 8, right: 10, cursor: "pointer" }}>❤️</span>
      <img src={resolveImageUrl(product.images[0])} alt={product.name} />
      <p>{product.name}</p>
      <p>{product.price}</p>
    </div>
  );
}
