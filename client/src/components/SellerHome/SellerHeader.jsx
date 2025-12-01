import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../../styles/sellerdashboard.module.css';

const SellerHeader = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <button onClick={toggleSidebar} className={styles.menuBtn}>☰</button>
        <span>Advantage <sup>Seller</sup></span>
      </div>

      <div className={styles.navActions}>

        <Link className={styles.btn} to="/seller/dashboard">
          Dashboard
        </Link>

        <Link className={styles.btn} to="/seller/chat">
          Inbox
        </Link>

        <Link className={`${styles.btn} ${styles.btnAdd}`} to="/seller/add-new-product">
          + Add Product
        </Link>

        <button className={`${styles.btn} ${styles.btnLogout}`}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default SellerHeader;