import React from "react";
import styles from "../../styles/searchpage.module.css";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products, backendURL }) => {
  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3 className={styles.emptyTitle}>No Products Found</h3>
        <p className={styles.emptyText}>
          We couldn't find any products matching your search. Try adjusting your filters or search for something else.
        </p>
      </div>
    );
  }

  return (
    <div id={styles.mainSection}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} backendURL={backendURL} />
      ))}
    </div>
  );
};

export default ProductGrid;
