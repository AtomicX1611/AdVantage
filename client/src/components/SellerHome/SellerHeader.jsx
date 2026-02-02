import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../../styles/sellerdashboard.module.css';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { API_CONFIG } from '../../config/api.config';

const backendURL = API_CONFIG.BACKEND_URL;

const SellerHeader = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      let response = await fetch(`${backendURL}/auth/logout`, {
        method: "DELETE",
        credentials: "include",
      });
      let data = await response.json();
      if (data.success) {
        dispatch(logout());
        navigate("/");
      }
    } catch (error) {
      alert("Logout failed. Please try again.");
      console.error("Logout Error:", error);
    }
  };

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

        <Link className={styles.btn} to="/seller/subscription">
          Subscriptions
        </Link>

        <Link className={styles.btn} to="/seller/chat">
          Inbox
        </Link>

        <Link className={`${styles.btn} ${styles.btnAdd}`} to="/seller/add-new-product">
          + Add Product
        </Link>

        <button className={`${styles.btn} ${styles.btnLogout}`} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default SellerHeader;