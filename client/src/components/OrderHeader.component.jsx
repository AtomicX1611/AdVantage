import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/myorders.module.css";

const OrderHeader = () => {
  return (
    <div className={styles.header}>
      <div className={styles.backIcon}>
        <Link to="/" aria-label="Go back">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>
      <div className={styles.headerText}>
        <h1 style={{ color: "black" }}>Your Orders</h1>
      </div>
    </div>
  );
};

export default OrderHeader;
