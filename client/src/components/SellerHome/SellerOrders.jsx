import React, { useEffect, useState } from 'react';
import styles from '../../styles/sellerdashboard.module.css';
import { API_CONFIG } from '../../config/api.config';
import { resolveImageUrl } from '../../utils/imageUrl';

const backendURL = API_CONFIG.BACKEND_URL;

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingData, setShippingData] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${backendURL}/user/seller/orders`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShippingChange = (orderId, field, value) => {
    setShippingData(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value
      }
    }));
  };

  const handleVerifyDelivery = async (orderId) => {
    try {
      const response = await fetch(`${backendURL}/user/order/${orderId}/verify-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const result = await response.json();
      if (result.success) {
        alert('Delivery verified successfully. 48-hour review window started.');
        fetchOrders();
      } else {
        alert(result.message || 'Delivery verification failed');
      }
    } catch (err) {
      console.error('Error verifying delivery:', err);
      alert('Network error.');
    }
  };

  const handleSellerCancel = async (orderId) => {
    const confirmed = window.confirm(
      'Cancel this paid order? Buyer and seller refunds will be added to pending payouts, and product will become available again.'
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`${backendURL}/user/order/${orderId}/seller-cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const result = await response.json();
      if (result.success) {
        alert('Order cancelled and refund entries are queued.');
        fetchOrders();
      } else {
        alert(result.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling paid order:', err);
      alert('Network error.');
    }
  };

  const handleShipOrder = async (orderId) => {
    const data = shippingData[orderId];
    if (!data || !data.awbCode || !data.courierName) {
      alert("Please provide both AWB Code and Courier Name.");
      return;
    }

    try {
      const response = await fetch(`${backendURL}/user/order/${orderId}/ship`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          awbCode: data.awbCode,
          courierName: data.courierName,
          expectedDeliveryDate: data.expectedDeliveryDate || null,
          trackingUrl: data.trackingUrl || null,
          notes: data.notes || null,
        })
      });

      const result = await response.json();
      if (result.success) {
        alert("Order marked as shipped!");
        fetchOrders();
      } else {
        alert(result.message || "Failed to ship order");
      }
    } catch (err) {
      console.error("Error shipping order:", err);
      alert("Network error.");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading your orders...</p>
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

  const paidAwaitingSeller = orders.filter(
    (order) => order.status === 'paid' && (!order.deliveryStatus || order.deliveryStatus === 'Pending')
  );

  const activeOrCompletedOrders = orders.filter(
    (order) => order.deliveryStatus && order.deliveryStatus !== 'Pending' && order.deliveryStatus !== 'Cancelled'
  );

  return (
    <div>
      <h2>Manage Orders</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Fulfill paid orders, verify deliveries, or cancel before shipping.
      </p>

      <h3 style={{ marginBottom: '12px' }}>Paid Orders Requiring Seller Action</h3>
      {paidAwaitingSeller.length > 0 ? (
        <div className={styles.grid} style={{ marginBottom: '28px' }}>
          {paidAwaitingSeller.map((order) => {
            const product = order.productId;
            if (!product) return null;

            return (
              <div key={order._id} className={styles.card}>
                <div className={styles.cardImageContainer}>
                  <img
                    src={product.images && product.images.length > 0
                      ? resolveImageUrl(product.images[0])
                      : 'https://placehold.co/300x300?text=No+Image'}
                    alt={product.name}
                    className={styles.cardImage}
                  />
                  <span style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: '#f59e0b',
                    color: 'white', padding: '6px 14px', borderRadius: '20px',
                    fontSize: '0.75rem', fontWeight: '600',
                  }}>
                    Awaiting Seller
                  </span>
                </div>

                <div className={styles.cardDetails}>
                  <h3>{product.name}</h3>
                  <p className={styles.cardPrice}>Order Amount: ₹{order.amount}</p>
                  <div style={{ marginTop: '15px' }}>
                    <input
                      type="text"
                      placeholder="AWB Code"
                      className={styles.inputField}
                      style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      value={shippingData[order._id]?.awbCode || ''}
                      onChange={(e) => handleShippingChange(order._id, 'awbCode', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Courier Name"
                      className={styles.inputField}
                      style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      value={shippingData[order._id]?.courierName || ''}
                      onChange={(e) => handleShippingChange(order._id, 'courierName', e.target.value)}
                    />
                    <input
                      type="date"
                      className={styles.inputField}
                      style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      value={shippingData[order._id]?.expectedDeliveryDate || ''}
                      onChange={(e) => handleShippingChange(order._id, 'expectedDeliveryDate', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Tracking URL (optional)"
                      className={styles.inputField}
                      style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      value={shippingData[order._id]?.trackingUrl || ''}
                      onChange={(e) => handleShippingChange(order._id, 'trackingUrl', e.target.value)}
                    />
                    <textarea
                      placeholder="Order notes (optional)"
                      className={styles.inputField}
                      style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', minHeight: '72px' }}
                      value={shippingData[order._id]?.notes || ''}
                      onChange={(e) => handleShippingChange(order._id, 'notes', e.target.value)}
                    />
                    <button
                      className={styles.btnAccept}
                      style={{ width: '100%', marginBottom: '10px' }}
                      onClick={() => handleShipOrder(order._id)}
                    >
                      Submit Delivery Details and Ship
                    </button>
                    <button
                      style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px', cursor: 'pointer', fontWeight: '600' }}
                      onClick={() => handleSellerCancel(order._id)}
                    >
                      Not Interested (Cancel Order)
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📦</span>
          <h3 className={styles.emptyTitle}>No Paid Orders Pending Action</h3>
          <p className={styles.emptyText}>
            Paid orders that need shipment or cancellation will appear here.
          </p>
        </div>
      )}

      <h3 style={{ marginBottom: '12px', marginTop: '10px' }}>Shipped / Delivered Orders</h3>
      {activeOrCompletedOrders.length > 0 ? (
        <div className={styles.grid}>
          {activeOrCompletedOrders.map((order) => {
            const product = order.productId;
            if (!product) return null;

            return (
              <div key={order._id} className={styles.card}>
                <div className={styles.cardImageContainer}>
                  <img
                    src={product.images && product.images.length > 0
                      ? resolveImageUrl(product.images[0])
                      : 'https://placehold.co/300x300?text=No+Image'}
                    alt={product.name}
                    className={styles.cardImage}
                  />
                  <span style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: order.deliveryStatus === 'Completed' ? '#10b981' : '#2563eb',
                    color: 'white', padding: '6px 14px', borderRadius: '20px',
                    fontSize: '0.75rem', fontWeight: '600',
                  }}>
                    {order.deliveryStatus || order.status}
                  </span>
                </div>

                <div className={styles.cardDetails}>
                  <h3>{product.name}</h3>
                  <p className={styles.cardPrice}>Order Amount: ₹{order.amount}</p>
                  <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#4b5563' }}>
                    <p><strong>AWB Code:</strong> {order.awbCode || 'NA'}</p>
                    <p><strong>Courier:</strong> {order.courierName || 'NA'}</p>
                    {order.deliveryDetails?.expectedDeliveryDate && (
                      <p><strong>Expected Delivery:</strong> {new Date(order.deliveryDetails.expectedDeliveryDate).toLocaleDateString()}</p>
                    )}
                    {order.deliveryDetails?.trackingUrl && (
                      <p><strong>Tracking URL:</strong> {order.deliveryDetails.trackingUrl}</p>
                    )}
                  </div>

                  {order.deliveryStatus === 'Shipped' && (
                    <button
                      className={styles.btnAccept}
                      style={{ width: '100%', marginTop: '10px' }}
                      onClick={() => handleVerifyDelivery(order._id)}
                    >
                      Verify Delivered Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🚚</span>
          <h3 className={styles.emptyTitle}>No Shipped Orders Yet</h3>
          <p className={styles.emptyText}>
            Once you ship orders, tracking and delivery verification will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
