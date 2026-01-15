// src/pages/ManagerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VerifyCard from '../components/Manager/VerifyCard.jsx';
import styles from '../styles/manager.module.css';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3000/manager/d', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
          },
      });

      if (res.status === 503) return setError('No Products to Verify');
      if (res.status === 500) return setError('Server Error');

      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        setError("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products", error);
      setError("Network Error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (pid) => {
    try {
      console.log("initaing verify");
      
      const res = await fetch("http://localhost:3000/manager/verify", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pid }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Verification Failed: " + data.message);
        return;
      }

      setProducts((prev) => prev.filter((p) => p._id !== pid));
      alert("Product Verified Successfully!");

    } catch (err) {
      console.error("Verify error:", err);
      alert("Server Error verifying product.");
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return <h2 className={styles.title}>{error}</h2>;
  }
  if (loading) {
    return <h2 className={styles.title}>Loading...</h2>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Manager Dashboard</h1>

      <div className={styles.cardsGrid}>
        {products.map((item) => (
          <VerifyCard
            key={item._id}
            productPhoto={item.images?.[0] || 'https://via.placeholder.com/150'}
            sellerName={item.seller?.username || 'Unknown Seller'}
            postingDate={new Date(item.postingDate).toISOString().split('T')[0]}
            category={item.category}
            type={item.isRental ? 'Rental' : 'Sale'}
            price={item.price}
            onVerify={() => handleVerify(item._id)}
            onViewDetails={() => handleViewDetails(item._id)}
            invoice={item.invoice}
          />
        ))}
      </div>
    </div>
  );
};

export default ManagerDashboard;
