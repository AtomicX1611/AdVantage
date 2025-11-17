// src/Components/RequestCard.jsx
import React from 'react';
import styles from '../../styles/viewrequest.module.css';

const RequestCard = ({ productPhoto, productName, requesterName, isRental, priceBid, fromDate, toDate }) => {
  return (
    <div className={styles.requestCard}>
      <img src={productPhoto} alt={productName} className={styles.productPhoto} />
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{productName}</h3>
        <p className={styles.requesterName}>Requester: {requesterName}</p>
        {isRental ? (
          <p className={styles.rentalDates}>From: {fromDate} To: {toDate}</p>
        ) : (
          <p className={styles.priceBid}>Price Bid: ${priceBid}</p>
        )}
      </div>
      <div className={styles.actions}>
        <button className={styles.chatButton}>Chat</button>
        <button className={styles.acceptButton}>Accept</button>
        <button className={styles.rejectButton}>Reject</button>
      </div>
    </div>
  );
};

export default RequestCard;