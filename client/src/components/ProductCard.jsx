// src/components/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/myorders.module.css";

const ProductCard = ({ product, backendURL }) => {
  if (!product.images || !product.images[0]) return null;
  
  return (
    <Link to={`/search/product/${product._id}`}>
      <div className={styles['product_card']}>
        <img
          src={`${backendURL}`}
          alt="Product"
          style={{ height: "35vh", objectFit: "cover" }}
        />
        <h4
          style={{
            marginLeft: "20px",
            fontSize: "15px",
            color: "black",
            fontWeight: "400",
            textAlign: "center",
            marginTop: "20px",
            padding: "0.5rem",
          }}
        >
          {product.name}
        </h4>
        <h3
          style={{
            fontSize: "20px",
            marginLeft: "0px",
            color: "black",
            textAlign: "right",
            marginRight: "5px",
            fontWeight: "600",
            padding: "0.5rem",
          }}
        >
          Rs. {product.price}/-
        </h3>
      </div>
    </Link>
  );
};

export default ProductCard;
