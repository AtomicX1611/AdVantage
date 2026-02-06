import React from "react";
import styles from "../styles/productdetails.module.css";

const SellerOptions = ({ verified }) => {
  return (
    <div className={styles.sellerOptions}>
      <button id="deleteProduct">Delete Product</button>
      <div id="sold">View Requests</div>
      {!verified && <button id="verifyButton">Verify</button>}
    </div>
  );
};

export default SellerOptions;
