// src/pages/MyOrders.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import OrderHeader from "../components/OrderHeader.component";
import DisputeFormModal from "../components/DisputeFormModal";
import styles from "../styles/myorders.module.css";
import API_CONFIG from '../config/api.config';
import { resolveImageUrl } from "../utils/imageUrl";

const MyOrders = () => {
  const backendURL = API_CONFIG.BACKEND_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disputeOrderId, setDisputeOrderId] = useState(null);
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [backendURL]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendURL}/user/buyer/orders`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    if (!window.confirm("Confirm that you have received a genuine product?")) return;

    try {
      const response = await fetch(`${backendURL}/user/order/${orderId}/mark-delivered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        alert("Order marked as received and completed.");
        fetchOrders();
      } else {
        alert(data.message || "Failed to mark as received.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  };

  const getReviewWindowText = (deliveredAt) => {
    if (!deliveredAt) return null;
    const endTime = new Date(deliveredAt).getTime() + (48 * 60 * 60 * 1000);
    const remainingMs = endTime - Date.now();
    if (remainingMs <= 0) return "48-hour review window ended";

    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m left to raise complaint`;
  };

  const openDisputeForm = (orderId) => {
    setDisputeOrderId(orderId);
  };

  const closeDisputeForm = () => {
    setDisputeOrderId(null);
  };

  const handleDisputeSubmit = async ({ subject, description, files }) => {
    if (!disputeOrderId) {
      return;
    }

    try {
      setDisputeSubmitting(true);
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('description', description);
      (files || []).forEach((file) => formData.append('proofs', file));

      const response = await fetch(`${backendURL}/user/order/${disputeOrderId}/dispute`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        alert("Dispute filed successfully!");
        closeDisputeForm();
        fetchOrders();
      } else {
        alert(data.message || "Failed to file dispute.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setDisputeSubmitting(false);
    }
  };

  return (
    <div className={styles.window}>
      <div className={styles['main-container']}>
        <OrderHeader />
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <span className={styles.loadingText}>Loading your orders...</span>
          </div>
        ) : orders.length === 0 ? (
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', padding: '20px' }}>
            {orders.map((order) => {
              const product = order.productId;
              if (!product) return null;
              const imageUrl = product.images && product.images.length > 0 
                ? resolveImageUrl(product.images[0]) : '/Assets/placeholder.png';

              return (
                <div key={order._id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
                  <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative', height: '200px' }}>
                      <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{
                        position: 'absolute', top: '10px', right: '10px', background: '#3b82f6', color: 'white',
                        padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
                      }}>
                        {order.deliveryStatus || order.status}
                      </span>
                    </div>
                    <div style={{ padding: '15px' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{product.name}</h4>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981' }}>₹{order.amount}</p>
                    </div>
                  </Link>

                  <div style={{ padding: '0 15px 15px 15px' }}>
                    {(order.status === 'paid' && (order.deliveryStatus === 'Pending' || order.deliveryStatus === 'Shipped')) && (
                      <button
                        onClick={() => handleMarkDelivered(order._id)}
                        style={{ width: '100%', padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
                        Mark as Received
                      </button>
                    )}
                    {order.deliveryStatus === 'Delivered' && !order.timerTriggered48Hour && (
                      <>
                        <button
                          onClick={() => handleMarkDelivered(order._id)}
                          style={{ width: '100%', padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
                          Mark as Received
                        </button>
                        <button
                          onClick={() => openDisputeForm(order._id)}
                          style={{ width: '100%', padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          Dispute Order
                        </button>
                        <p style={{ marginTop: '8px', color: '#6b7280', fontSize: '12px' }}>
                          {getReviewWindowText(order.deliveredAt)}
                        </p>
                      </>
                    )}
                    {order.deliveryStatus === 'Pending' && order.status === 'paid' && (
                      <p style={{ color: '#2563eb', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>
                        Seller has not updated shipping yet. If you already received it, click Mark as Received.
                      </p>
                    )}
                    {order.deliveryStatus === 'Shipped' && (
                      <p style={{ color: '#2563eb', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>
                        If you already received the product, click Mark as Received. Complaint opens after seller verifies delivery.
                      </p>
                    )}
                    {order.deliveryStatus === 'Completed' && (
                      <p style={{ color: '#10b981', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>Order Completed</p>
                    )}
                    {order.deliveryStatus === 'Cancelled' && (
                      <p style={{ color: '#ef4444', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>Order Cancelled and Refund Queued</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DisputeFormModal
          isOpen={Boolean(disputeOrderId)}
          onClose={closeDisputeForm}
          onSubmit={handleDisputeSubmit}
          submitting={disputeSubmitting}
        />
      </div>
    </div>
  );
};

export default MyOrders;
