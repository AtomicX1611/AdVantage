// src/components/Manager/VerifyCard.jsx
import React from 'react';
import styles from '../../styles/manager.module.css';

const VerifyCard = ({ productPhoto, sellerName, postingDate, category, type, price,onVerify }) => {
  return (
    <div className={styles.verifyCard}>
      <img src={productPhoto} alt="Product" className={styles.productPhoto} />
      <div className={styles.productInfo}>
        <h3 className={styles.sellerName}>Seller: {sellerName}</h3>
        <p className={styles.postingDate}>Posted on: {postingDate}</p>
        <p className={styles.category}>Category: {category}</p>
        <p className={styles.type}>Type: {type}</p>
        <p className={styles.price}>Price: ${price}</p>
      </div>
      <div className={styles.actions}>
        <button className={styles.verifyButton} onClick={onVerify}>Verify</button>
        <button className={styles.viewDetailsButton}>View Details</button>
      </div>
    </div>
  );
};

export default VerifyCard;