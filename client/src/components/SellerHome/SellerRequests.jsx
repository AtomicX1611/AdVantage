import React, { useState, useEffect } from 'react';
import styles from '../../styles/sellerdashboard.module.css';
import { API_CONFIG } from '../../config/api.config';

const backendURL = API_CONFIG.BACKEND_URL;

const SellerRequests = () => {
  const [productsWithRequests, setProductsWithRequests] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myAccount, setMyAccount] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${backendURL}/user/products`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();

        console.log("data: ", data.products)

        if (data.success) {
          const activeRequests = data.products.filter((product) => {
            const hasRequests = product.requests && product.requests.length > 0;
            const isNotSold = !product.soldTo;
            return hasRequests && isNotSold;
          });
          console.log("active requests: ", activeRequests);
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

  // useEffect(() => {
  //     async function fetchContacts() {
  //       console.log("1. Running fetch contacts...");
  //       try {
  //         const response = await fetch(`${backendURL}chat/contacts`, {
  //           method: "GET",
  //           headers: { "Content-Type": "application/json" },
  //           credentials: "include",
  //         });

  //         const data = await response.json();
  //         console.log("2. Fetch :", data);

  //         if (data.success) {
  //           setMyAccount(data.myAccount);
  //         }
  //       } catch (error) {
  //         console.error("FAILED to fetch contacts:", error);
  //       }
  //     }
  //     fetchContacts();
  //   }, []); 

  const handleViewRequests = (product) => {
    setSelectedProduct(product);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

  const handleAccept = async (productId, buyerId) => {
    setError(null);
    try {
      const response = await fetch(`${backendURL}/user/acceptRequest/${productId}/${buyerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ productId })
      });

      const data = await response.json();
      console.log("data in accept: ", data);

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

  const handleReject = async (productId, buyerId) => {
  setError(null);

  try {
    const response = await fetch(`${backendURL}/user/rejectRequest/${productId}/${buyerId}`, {
      method: 'DELETE',
      credentials: "include",
    });

    const data = await response.json();

    if (data.success) {
      const filterRequests = (requests) => 
        requests.filter((req) => {
          const idInRequest = req.buyer?._id || req.buyer; 
          return idInRequest.toString() !== buyerId.toString();
        });

      setProductsWithRequests((prev) => {
        return prev
          .map((p) => {
            if (p._id === productId) {
              const newRequests = filterRequests(p.requests);
              return { ...p, requests: newRequests };
            }
            return p;
          })
          .filter((p) => p.requests.length > 0);
      });
      setSelectedProduct((prev) => {
        if (!prev) return null;
        const newRequests = filterRequests(prev.requests);
        return newRequests.length === 0 ? null : { ...prev, requests: newRequests };
      });

    } else {
      setError(data.message || "Failed to reject request.");
    }
  } catch (err) {
    console.error("Reject Error:", err);
    setError("Network error while rejecting request.");
  }
};

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading requests...</p>
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

  if (selectedProduct) {
    return (
      <div>
        <button
          onClick={handleBack}
          className={styles.btn}
          style={{ color: '#12344d', paddingLeft: 0, marginBottom: '20px', fontWeight: '600' }}
        >
          ← Back to All Requests
        </button>

        <h2>Requests for: {selectedProduct.name}</h2>

        <div style={{ marginTop: '20px' }}>
          {selectedProduct.requests.map((req, index) => {
            const buyerName = req.buyer?.username || "Interested Buyer";
            const buyerId = req.buyer?._id || req._id;
            const biddingPrice = req.biddingPrice;
            console.log("Request buyer: ", buyerName, buyerId);
            return (
              <div key={req._id || index} className={styles.requestRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #12344d 0%, #1a5276 100%)', color: 'white', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem'
                  }}>
                    {buyerName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <strong>{buyerName}</strong>

                    {selectedProduct.isRental && req.from && req.to ? (
                      <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '4px' }}>
                        Requested: {new Date(req.from).toLocaleDateString()} - {new Date(req.to).toLocaleDateString()}
                      </p>
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '4px' }}>Wants to buy this item</p>
                    )}

                    {biddingPrice && (
                      <p style={{ fontSize: '0.9rem', color: '#059669', fontWeight: 'bold', marginTop: '5px' }}>
                        Bidding Price: ₹{biddingPrice}
                      </p>
                    )}
                  </div>
                </div>

                <div className={styles.requestActions}>
                  <button
                    className={styles.btnAccept}
                    onClick={() => handleAccept(selectedProduct._id, req.buyer._id)}
                  >
                    Accept
                  </button>
                  <button
                    className={styles.btnReject}
                    onClick={() => handleReject(selectedProduct._id, req.buyer._id)}
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
      
      {productsWithRequests.length > 0 ? (
        <div className={styles.grid}>
          {productsWithRequests.map((item) => (
            <div key={item._id} className={styles.card}>
              <div className={styles.cardImageContainer}>
                <img
                  src={item.images && item.images.length > 0 
                    ? `${backendURL}/${item.images[0].replace(/\\/g, '/')}` 
                    : 'https://placehold.co/300x300?text=No+Image'}
                  alt={item.name}
                  className={styles.cardImage}
                />
                <span style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'linear-gradient(135deg, #12344d 0%, #1a5276 100%)', 
                  color: 'white', padding: '6px 12px',
                  borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  {item.requests.length} {item.requests.length === 1 ? 'Request' : 'Requests'}
                </span>
              </div>

              <div className={styles.cardDetails}>
                <h3>{item.name}</h3>
                <p className={styles.cardPrice}>
                  {item.isRental ? `₹${item.price}/day` : `₹${item.price}`}
                </p>

                <div className={styles.cardActions}>
                  <button
                    className={styles.btnAvl}
                    style={{ flex: 1 }}
                    onClick={() => handleViewRequests(item)}
                  >
                    View Requests
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📋</span>
          <h3 className={styles.emptyTitle}>No pending requests</h3>
          <p className={styles.emptyText}>
            You don't have any buyer requests at the moment. Check back later!
          </p>
        </div>
      )}
    </div>
  );
};

export default SellerRequests;