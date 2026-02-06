// src/pages/MyOrders.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import OrderHeader from "../components/OrderHeader.component";
import ProductList from "../components/ProductList";
import styles from "../styles/myorders.module.css";
import API_CONFIG from '../config/api.config';

const MyOrders = () => {
  const backendURL = API_CONFIG.BACKEND_URL;
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYourProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendURL}/user/yourProducts`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Your products:', data);
          setUserProducts(data.products || []);
        } else {
          console.error('Failed to fetch products:', response.status);
          setUserProducts([]);
        }
      } catch (error) {
        console.error('Error fetching your products:', error);
        setUserProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchYourProducts();
  }, [backendURL]);

  return (
    <div className={styles.window}>
      <div className={styles['main-container']}>
        <OrderHeader />
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <span className={styles.loadingText}>Loading your orders...</span>
          </div>
        ) : userProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <h3 className={styles.emptyTitle}>No Orders Yet</h3>
            <p className={styles.emptyText}>
              You haven't purchased any products yet. Start browsing to find amazing deals!
            </p>
            <Link to="/search" className={styles.browseBtn}>
              Browse Products
            </Link>
          </div>
        ) : (
          <ProductList userProducts={userProducts} backendURL={backendURL} />
        )}
      </div>
    </div>
  );
};

export default MyOrders;
