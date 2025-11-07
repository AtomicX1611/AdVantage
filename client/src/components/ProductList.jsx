// src/components/ProductList.jsx
import React from "react";
import ProductCard from "./ProductCard";
import styles from "../styles/myorders.module.css";

const ProductList = ({ userProducts, backendURL }) => {
  return (
    <div className={styles['product_list']}>
      {userProducts.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          backendURL={backendURL}
        />
      ))}
    </div>
  );
};

export default ProductList;
