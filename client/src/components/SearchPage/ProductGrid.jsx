import React from "react";
import styles from "../../styles/searchpage.module.css";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products, backendURL }) => {
  if (products.length === 0) {
    return (
      <h3
        style={{
          marginTop: "30vh",
          marginLeft: "30vw",
          color: "black",
        }}
      >
        No products found in Search
      </h3>
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
