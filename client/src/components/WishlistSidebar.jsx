import React from "react";
import ProductItem from "./ProductItem";
import styles from "../styles/wishlist.module.css";

export default function WishlistSidebar({ products, addToCompare }) {
  return (
    <div className={styles.sidebar}>
      <h2>Wishlist</h2>
      <div id="product-list" className={styles["product-list"]}>
        {products.map((p) => (
          <ProductItem key={p.id} product={p} addToCompare={addToCompare} />
        ))}
      </div>
    </div>
  );
}
