import React from "react";
import styles from "../styles/productdetails.module.css";

const ActionButtons = ({ isRental, soldTo, onAddToWishlist, onRentNow, onBuyNow }) => {
  return (
    <div className={styles.options}>
      <button id="addToWishlist" className={styles.btn} onClick={onAddToWishlist}>
        Add to Wishlist
      </button>

      <button className={styles.btn}>Chat with Seller</button>

      {!soldTo && !isRental && (
        <button className={styles.btn} onClick={onBuyNow}>Buy Now</button>
      )}

      {!soldTo && isRental && (
        <button className={styles.btn} onClick={onRentNow}>
          Rent Now
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
