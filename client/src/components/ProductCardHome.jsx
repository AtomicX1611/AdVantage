import React from 'react';
import styles from '../styles/home.module.css';

const ProductCardHome = ({ product, backendURL, onClick }) => {
  if (!product.images || !product.images[0]) {
    return null;
  }

  return (
    <div onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className={styles.productCard}>
        <img 
          src={`${backendURL}${product.images[0]}`} 
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
