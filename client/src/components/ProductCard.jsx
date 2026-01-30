// src/components/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/myorders.module.css";

const ProductCard = ({ product, backendURL }) => {
  const imageUrl = product.images && product.images.length > 0 
    ? `${backendURL}/${product.images[0]}` 
    : '/Assets/placeholder.png';
  
  return (
    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
      <div className={styles['product_card']}>
        <div className={styles.imageContainer}>
          {product.isRental && (
            <span className={styles.rentalBadge}>Rental</span>
          )}
          <span className={styles.statusBadge}>✓ Purchased</span>
          <img
            src={imageUrl}
            alt={product.name || "Product"}
          />
        </div>
        <div className={styles.cardContent}>
          <h4 className={styles.productName}>{product.name}</h4>
          <div className={styles.productPrice}>
            ₹{product.price?.toLocaleString()}
            {product.isRental && <span>/day</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
