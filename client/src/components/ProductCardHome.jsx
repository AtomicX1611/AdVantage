import React from 'react';
import styles from '../styles/home.module.css';

const ProductCardHome = ({ product, backendURL, onClick }) => {
  // Handle both images array format and Image1Src format
  const imageUrl = product.images && product.images[0] 
    ? `${backendURL}${product.images[0]}`
    : product.Image1Src || '/Assets/placeholder.png';

  return (
    <div onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className={styles.productCard}>
        <img 
          src={imageUrl} 
          alt={product.name} 
          style={{ width: '100%', height: '35vh' }}
        />
        <h4 style={{ 
          marginLeft: '20px', 
          fontSize: '15px', 
          color: 'black', 
          fontWeight: '400', 
          textAlign: 'center', 
          marginTop: '20px' 
        }}>
          {product.name}
        </h4>
        <h3 style={{ 
          fontSize: '20px', 
          marginLeft: '0px', 
          color: 'black', 
          textAlign: 'right', 
          marginRight: '5px', 
          fontWeight: '600' 
        }}>
          Rs. {product.price}/-
        </h3>
      </div>
    </div>
  );
};

export default ProductCardHome;
