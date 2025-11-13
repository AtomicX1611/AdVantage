import React from "react";
import ComparisonCard from "./ComparisonCard";
import styles from "../styles/wishlist.module.css";

export default function ComparisonSection({ products, removeFromCompare }) {
  return (
    <div className={styles.main}>
      <h2>Compare Products</h2>
      <div id="comparison-container" className={styles["comparison-container"]}>
        {products.map((p) => (
          <ComparisonCard
            key={p.id}
            product={p}
            removeFromCompare={removeFromCompare}
          />
        ))}
      </div>
    </div>
  );
}
