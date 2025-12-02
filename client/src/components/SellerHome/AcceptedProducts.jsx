import React, { useEffect, useState } from 'react';
import styles from '../../styles/sellerdashboard.module.css';

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
      const response = await fetch('http://localhost:3000/user/products', {
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
      const response = await fetch(`http://localhost:3000/user/revokeAccepted/${productId}`, {
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
    return <div className={styles.content}>Loading accepted products...</div>;
  }

  if (error) {
    return <div className={styles.content} style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h2>Accepted - Awaiting Payment</h2>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        These products have been accepted by you but the buyer hasn't completed payment yet.
      </p>

      <div className={styles.grid}>
        {acceptedProducts.length > 0 ? (
          acceptedProducts.map((product) => {
            // Find the accepted buyer from requests (buyer is just an ID string)
            const acceptedRequest = product.requests.find(
              (req) => req.buyer === product.sellerAcceptedTo
            );

            return (
              <div key={product._id} className={styles.card}>
                <div className={styles.cardImageContainer}>
                  <img
                    src={product.images && product.images.length > 0 
                      ? `http://localhost:3000/${product.images[0].replace(/\\/g, '/')}`
                      : 'https://placehold.co/300x300?text=No+Image'}
                    alt={product.name}
                    className={styles.cardImage}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#16a34a',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    Accepted
                  </div>
                </div>

                <div className={styles.cardDetails}>
                  <div>
                    <h3>{product.name}</h3>
                    
                    <div style={{ marginTop: '12px' }}>
                      <p style={{ fontWeight: 'bold', color: '#334155', fontSize: '0.95rem' }}>
                        Your Price: ${product.price}{product.isRental ? '/day' : ''}
                      </p>
                      
                      {acceptedRequest && acceptedRequest.biddingPrice && (
                        <p style={{ 
                          color: acceptedRequest.biddingPrice >= product.price ? '#16a34a' : '#dc2626', 
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          marginTop: '4px'
                        }}>
                          Buyer's Bid: ${acceptedRequest.biddingPrice}
                        </p>
                      )}
                    </div>

                    {acceptedRequest && (
                      <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#64748b' }}>
                        <p>
                          <strong>Category:</strong> {product.category}
                        </p>
                        <p style={{ marginTop: '4px' }}>
                          <strong>Location:</strong> {product.city}, {product.state}
                        </p>
                        
                        {product.isRental && acceptedRequest.from && acceptedRequest.to && (
                          <p style={{ marginTop: '8px', color: '#0f172a', fontSize: '0.85rem' }}>
                            <strong>Rental Period:</strong><br/>
                            {new Date(acceptedRequest.from).toLocaleDateString()} - {new Date(acceptedRequest.to).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
                    <button
                      className={`${styles.btn} ${styles.btnLogout}`}
                      style={{ width: '100%' }}
                      onClick={() => handleRevoke(product._id)}
                    >
                      Revoke Acceptance
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: '#64748b', width: '100%' }}>
            No accepted products awaiting payment.
          </p>
        )}
      </div>
    </div>
  );
};

export default AcceptedProducts;
