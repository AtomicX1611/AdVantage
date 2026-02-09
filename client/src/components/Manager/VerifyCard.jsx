// src/components/Manager/VerifyCard.jsx
import React from 'react';
import styles from '../../styles/manager.module.css';

const VerifyCard = ({ productPhoto, sellerName, postingDate, category, type, price, onVerify, onViewDetails, invoice }) => {
  return (
    <div className={styles.verifyCard}>
      <div className={styles.cardImageContainer}>
        <img src={import.meta.env.VITE_BACKEND_URL + "/" + productPhoto} alt="Product" className={styles.productPhoto} />
        <span className={`${styles.typeBadge} ${type === 'Rental' ? styles.typeRental : styles.typeSale}`}>
          {type}
        </span>
      </div>
      <div className={styles.productInfo}>
        <h3 className={styles.sellerName}>{sellerName}</h3>
        <p className={styles.postingDate}>
          <span className={styles.metaIcon}>📅</span> {postingDate}
        </p>
        <p className={styles.category}>
          <span className={styles.categoryBadge}>{category}</span>
        </p>
        <p className={styles.price}>₹{price}</p>
        {invoice ? (
          <a
            href={import.meta.env.VITE_BACKEND_URL + "/" + invoice}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.invoiceLink}
          >
            📄 View Invoice
          </a>
        ) : (
          <span className={styles.noInvoice}>No invoice provided</span>
        )}
      </div>
      <div className={styles.actions}>
        <button className={styles.verifyButton} onClick={onVerify}>✓ Verify</button>
        <button className={styles.viewDetailsButton} onClick={onViewDetails}>View Details</button>
      </div>
    </div>
  );
};

export default VerifyCard;