import React, { useEffect, useState } from 'react';
import styles from '../../styles/sellerdashboard.module.css';
import { API_CONFIG } from '../../config/api.config';

const backendURL = API_CONFIG.BACKEND_URL;

const AcceptedProducts = () => {
  const [acceptedProducts, setAcceptedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAcceptedProducts();
  }, []);

  const fetchAcceptedProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${backendURL}/user/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await response.json();

      console.log(data);

      if (data.success) {
        // Filter products where sellerAcceptedTo is not null and soldTo is null
        const filtered = data.products.filter(
          (product) => product.sellerAcceptedTo != null && product.soldTo == null
        );
        setAcceptedProducts(filtered);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching accepted products:', err);
      setError('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (productId) => {
    if (!window.confirm('Are you sure you want to revoke this accepted request? The buyer will be notified.')) {
      return;
    }

    try {
      const response = await fetch(`${backendURL}/user/revokeAccepted/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        // Remove the product from the list after successful revoke
        setAcceptedProducts((prev) => prev.filter((p) => p._id !== productId));
        alert('Request revoked successfully!');
      } else {
        alert(data.message || 'Failed to revoke request');
      }
    } catch (err) {
      console.error('Error revoking request:', err);
      alert('Network error while revoking request');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading accepted products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>⚠️</span>
        <h3 className={styles.emptyTitle}>Something went wrong</h3>
        <p className={styles.emptyText}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Accepted - Awaiting Payment</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        These products have been accepted by you but the buyer hasn't completed payment yet.
      </p>

      {acceptedProducts.length > 0 ? (
        <div className={styles.grid}>
          {acceptedProducts.map((product) => {
            const acceptedRequest = product.requests.find(
              (req) => req.buyer === product.sellerAcceptedTo
            );

            return (
              <div key={product._id} className={styles.card}>
                <div className={styles.cardImageContainer}>
                  <img
                    src={product.images && product.images.length > 0 
                      ? `${backendURL}/${product.images[0].replace(/\\/g, '/')}`
                      : 'https://placehold.co/300x300?text=No+Image'}
                    alt={product.name}
                    className={styles.cardImage}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}>
                    Accepted
                  </span>
                </div>

                <div className={styles.cardDetails}>
                  <h3>{product.name}</h3>
                  
                  <p className={styles.cardPrice}>
                    ₹{product.price}{product.isRental ? '/day' : ''}
                  </p>
                  
                  {acceptedRequest && acceptedRequest.biddingPrice && (
                    <p style={{ 
                      color: acceptedRequest.biddingPrice >= product.price ? '#059669' : '#dc2626', 
                      fontWeight: '600',
                      fontSize: '0.9rem',
                    }}>
                      Buyer's Bid: ₹{acceptedRequest.biddingPrice}
                    </p>
                  )}

                  {acceptedRequest && (
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#6b7280' }}>
                      <p><strong>Category:</strong> {product.category}</p>
                      <p style={{ marginTop: '4px' }}>
                        <strong>Location:</strong> {product.city}, {product.state}
                      </p>
                      
                      {product.isRental && acceptedRequest.from && acceptedRequest.to && (
                        <p style={{ marginTop: '8px', color: '#1a1a2e' }}>
                          <strong>Rental Period:</strong><br/>
                          {new Date(acceptedRequest.from).toLocaleDateString()} - {new Date(acceptedRequest.to).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  <div className={styles.cardActions}>
                    <button
                      className={styles.btnDel}
                      style={{ flex: 1 }}
                      onClick={() => handleRevoke(product._id)}
                    >
                      Revoke Acceptance
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>✅</span>
          <h3 className={styles.emptyTitle}>No pending acceptances</h3>
          <p className={styles.emptyText}>
            You don't have any accepted products awaiting payment.
          </p>
        </div>
      )}
    </div>
  );
};

export default AcceptedProducts;
