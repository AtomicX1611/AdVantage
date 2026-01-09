import React from "react";
import styles from "../../styles/searchpage.module.css";

const ProductCard = ({ product, backendURL }) => {
  const imageUrl = product.images && product.images.length > 0 
    ? `${backendURL}/${product.images[0]}` 
    : '/Assets/placeholder.png';
    
  return (
    <a href={`/product/${product._id}`} style={{ color: "black" }}>
      <div className={styles.products}>
        <img
          src={imageUrl}
          alt={product.name}
          className={styles.images}
        />
        <h4
          style={{
            marginLeft: "20px",
            fontSize: "15px",
            color: "black",
            textAlign: "center",
            marginTop: "10px",
            fontWeight: 400,
          }}
        >
          {product.name}
        </h4>
        <h3
          style={{
            fontSize: "20px",
            color: "black",
            textAlign: "right",
            marginRight: "5px",
            fontWeight: 600,
          }}
        >
          Rs. {product.price}/-
        </h3>
      </div>
    </a>
  );
};

export default ProductCard;
