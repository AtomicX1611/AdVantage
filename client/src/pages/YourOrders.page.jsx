// src/pages/MyOrders.jsx
import React, { useState, useEffect } from "react";
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
      <OrderHeader />
      <div className={styles['main-container']}>
        {loading ? (
          <div>Loading your orders...</div>
        ) : (
          <ProductList userProducts={userProducts} backendURL={backendURL} />
        )}
      </div>
    </div>
  );
};

export default MyOrders;
