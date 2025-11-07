import React from "react";
import styles from "../styles/paymentpage.module.css";

const PaymentData = ({ type, duration, validTill, Price }) => {
  return (
    <div className={`${styles["payment-details"]} ${styles.box}`}>
      <div className={styles.head}>Payment Details</div>
      <div className={styles.details}>
        <div className={styles.detail}>
          <ul>
            <li>
              Subscription Type: <span id="type">{type}</span>
            </li>
          </ul>
        </div>
        <div className={styles.detail}>
          <ul>
            <li>
              Subscription Duration: <span>{duration}</span>
            </li>
          </ul>
        </div>
        <div className={styles.detail}>
          <ul>
            <li>
              Valid Till: <span>{validTill}</span>
            </li>
          </ul>
        </div>
        <div className={styles.detail}>
          <ul>
            <li>
              Price: <span>{Price}</span>
            </li>
          </ul>
        </div>
        <div className={styles.detail}>
          <ul>
            <li>
              Total Amount payable: <span><b>{Price}</b></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentData;