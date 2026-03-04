// src/pages/ManagerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import VerifyCard from '../components/Manager/VerifyCard.jsx';
import ComplaintList from '../components/Manager/ComplaintList.jsx';
import styles from '../styles/manager.module.css';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('verify');
  const [managerCategory, setManagerCategory] = useState('');

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
        if (data.category) setManagerCategory(data.category);
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

  const fetchComplaints = async () => {
    try {
      const res = await fetch('http://localhost:3000/manager/complaints', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error("Error fetching complaints", err);
    }
  };

  const handleVerify = async (pid) => {
    try {
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

  const handleResolveComplaint = async (complaintId, status, resolution) => {
    try {
      const res = await fetch(`http://localhost:3000/manager/complaints/${complaintId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resolution }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Complaint updated successfully");
        setComplaints((prev) =>
          prev.map((c) =>
            c._id === complaintId ? { ...c, status, resolution } : c
          )
        );
      } else {
        alert(data.message || "Failed to update complaint");
      }
    } catch (err) {
      console.error("Error resolving complaint:", err);
      alert("Error updating complaint");
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:3000/auth/logout', {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        dispatch(logout());
        navigate('/login');
      } else {
        alert('Logout failed. Please try again.');
      }
    } catch (err) {
      console.error('Logout Error:', err);
      alert('Logout failed. Please try again.');
    }
  };

  useEffect(() => {
    fetchData();
    fetchComplaints();
  }, []);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⚠️</div>
            <h3 className={styles.emptyTitle}>{error}</h3>
            <p className={styles.emptyText}>Please try again later or contact support if the issue persists.</p>
          </div>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Loading products for verification...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderTop}>
            <h1 className={styles.title}>Manager Dashboard</h1>
            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
          <p className={styles.subtitle}>
            Category: <strong>{managerCategory || 'Loading...'}</strong> — Review products and handle complaints
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            className={`${styles.tabButton} ${activeTab === 'verify' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            Product Verification ({products.length})
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'complaints' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            Complaints ({complaints.length})
          </button>
        </div>

        {activeTab === 'verify' && (
          <>
            <div className={styles.statsBar}>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.statIconPending}`}>📋</div>
                <div>
                  <div className={styles.statValue}>{products.length}</div>
                  <div className={styles.statLabel}>Pending Review</div>
                </div>
              </div>
            </div>

            {products.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✅</div>
                <h3 className={styles.emptyTitle}>All Caught Up!</h3>
                <p className={styles.emptyText}>There are no products waiting for verification in your category right now.</p>
              </div>
            ) : (
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
            )}
          </>
        )}

        {activeTab === 'complaints' && (
          <ComplaintList
            complaints={complaints}
            onResolve={handleResolveComplaint}
          />
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
