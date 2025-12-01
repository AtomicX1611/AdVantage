import React, { useState, useEffect } from 'react';
import styles from '../../styles/sellerdashboard.module.css';

const SellerRequests = () => {
  const [productsWithRequests, setProductsWithRequests] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:3000/user/products',{
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();

        if (data.success) {
          const activeRequests = data.products.filter((product) => {
            const hasRequests = product.requests && product.requests.length > 0;
            const isNotSold = !product.soldTo; 
            return hasRequests && isNotSold;
          });
          console.log("active requests: ",activeRequests);
          setProductsWithRequests(activeRequests);
        } else {
          setError('Failed to load data');
        }
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError('Network error. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);
  const handleViewRequests = (product) => {
    setSelectedProduct(product);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

  const handleAccept = async (productId, requestId) => {
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/user/acceptRequest/${productId}/${requestId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ productId, requestId })
      });

      const data = await response.json();
      console.log("data in accept: ",data);

      if (data.success) {
        setProductsWithRequests((prevProducts) => 
          prevProducts.filter(p => p._id !== productId)
        );
        
        setSelectedProduct(null);
        alert("Request Accepted! Item moved to Sold/Rented.");
      } else {
        setError(data.message || "Failed to accept request.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error while accepting request.");
    }
  };

  const handleReject = async (productId, requestId) => {
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/user/rejectRequest/${productId}/${requestId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ productId, requestId })
      });

      const data = await response.json();
      console.log("data in reject: ",data);

      if (data.success) {
        const updatedRequests = selectedProduct.requests.filter(
          (req) => req._id !== requestId
        );
        const updatedProduct = { ...selectedProduct, requests: updatedRequests };

        if (updatedRequests.length === 0) {
          setProductsWithRequests((prev) => 
            prev.filter(p => p._id !== productId)
          );
          setSelectedProduct(null); 
        } else {
          setSelectedProduct(updatedProduct);
          setProductsWithRequests((prev) => 
            prev.map(p => (p._id === productId ? updatedProduct : p))
          );
        }
      } else {
        setError(data.message || "Failed to reject request.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error while rejecting request.");
    }
  };

  if (isLoading) return <div className={styles.content}>Loading requests...</div>;
  if (error) return <div className={styles.content} style={{color: 'red'}}>{error}</div>;

  if (selectedProduct) {
    return (
      <div>
        <button 
          onClick={handleBack} 
          className={styles.btn} 
          style={{ color: '#333', paddingLeft: 0, marginBottom: '20px' }}
        >
          ← Back to All Requests
        </button>
        
        <h2>Requests for: {selectedProduct.name}</h2>
        
        <div style={{ marginTop: '20px' }}>
          {selectedProduct.requests.map((req, index) => {
            // Note: We assume backend .populate('requests.buyer') so we have name/email
            // If backend only sends ID, you won't see a name here.
            const buyerName = req.buyer?.name || "Interested Buyer"; 
            const buyerId = req.buyer?._id || req._id; // Fallback for ID

            return (
              <div key={req._id || index} className={styles.requestRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', 
                      background: '#0f172a', color: 'white', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}>
                    {buyerName.charAt(0).toUpperCase()}
                  </div>
                  
                  <div>
                    <strong>{buyerName}</strong>
                    
                    {selectedProduct.isRental && req.from && req.to ? (
                      <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Requested Dates: <br/>
                        {new Date(req.from).toLocaleDateString()} - {new Date(req.to).toLocaleDateString()}
                      </p>
                    ) : (
                      <p>Wants to buy this item</p>
                    )}
                  </div>
                </div>
                
                <div>
                   <button 
                     className={`${styles.btn} ${styles.btnAdd}`} 
                     style={{ marginRight: '10px' }}
                     onClick={() => handleAccept(selectedProduct._id, req._id)}
                   >
                     Accept
                   </button>
                   <button 
                     className={`${styles.btn} ${styles.btnLogout}`}
                     onClick={() => handleReject(selectedProduct._id, req._id)}
                   >
                     Reject
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Items with Active Requests</h2>
      <div className={styles.grid}>
        {productsWithRequests.length > 0 ? (
          productsWithRequests.map((item) => (
            <div key={item._id} className={styles.card}>
              
              <div className={styles.cardImageContainer}>
                <img 
                  src={item.images && item.images.length > 0 ? item.images[0] : 'https://placehold.co/300x300?text=No+Image'} 
                  alt={item.name} 
                  className={styles.cardImage} 
                />

                <div style={{
                  position: 'absolute', top: '10px', right: '10px', 
                  background: '#333', color: 'white', padding: '5px 10px', 
                  borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {item.requests.length} Requests
                </div>
              </div>
              
              <div className={styles.cardDetails}>
                <div>
                  <h3>{item.name}</h3>
                  <p style={{ fontWeight: 'bold' }}>
                    {item.isRental ? `Rent: $${item.price}/day` : `Price: $${item.price}`}
                  </p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                  <button 
                    className={`${styles.btn} ${styles.btnAdd}`} 
                    style={{ width: '100%' }}
                    onClick={() => handleViewRequests(item)}
                  >
                    View Requests
                  </button>

                  <button 
                     className={styles.btn}
                     style={{ 
                       width: '100%', 
                       border: '1px solid #ccc', 
                       color: '#333' 
                     }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#64748b', width: '100%' }}>
            No pending requests found.
          </p>
        )}
      </div>
    </div>
  );
};

export default SellerRequests;