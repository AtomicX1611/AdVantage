import React from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/searchpage.module.css";

const ProductCard = ({ product, backendURL }) => {
  const imageUrl = product.images && product.images.length > 0 
    ? `${backendURL}/${product.images[0]}` 
    : '/Assets/placeholder.png';
    
  return (
    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
      <div className={styles.products}>
        <div className={styles.imageWrapper}>
          {product.isRental && (
            <span className={styles.rentalBadge}>For Rent</span>
          )}
          {product.verified && (
            <span className={styles.verifiedBadge}>
              ✓ Verified
            </span>
          )}
          <img
            src={imageUrl}
            alt={product.name}
            className={styles.images}
          />
        </div>
        <div className={styles.productInfo}>
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
