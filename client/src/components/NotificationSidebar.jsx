import React, { useState, useEffect, useRef } from 'react';
import classes from '../styles/header.module.css';
import NotificationCard from './NotificationCard';
import API_CONFIG from '../config/api.config';
import { useNavigate } from 'react-router-dom';

const POLL_INTERVAL_MS = 30000; // 30s

const NotificationSidebar = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const abortRef = useRef(null);
  const navigate = useNavigate();

  const backend = API_CONFIG.BACKEND_URL;
  const endpoints = API_CONFIG.API_ENDPOINTS;

  const fetchNotifications = async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(backend + endpoints.NOTIFICATIONS_FETCH, {
        method: 'GET',
        credentials: 'include',
        signal,
      });
      const data = await res.json();
      if (data && data.success) {
        setNotifications(data.notifications || []);
      } else {
        setError(data?.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    abortRef.current = new AbortController();
    fetchNotifications(abortRef.current.signal);

    // start polling
    intervalRef.current = setInterval(() => {
      fetchNotifications();
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAllReadBackend = async () => {
    try {
      const res = await fetch(backend + endpoints.NOTIFICATIONS_MARK_ALL_READ, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const handleMarkAllRead = async () => {
    const result = await markAllReadBackend();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const markReadBackend = async (id) => {
    try {
      const res = await fetch(`${backend}${endpoints.NOTIFICATIONS_MARK_READ}/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteBackend = async (id) => {
    try {
      const res = await fetch(`${backend}${endpoints.NOTIFICATIONS_MARK_READ}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const handleOpenNotification = async (notification) => {
    if (!notification) return;
    if (!notification.isRead) {
      const res = await markReadBackend(notification._id);
      if (res.success) {
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
      }
    }

    // Routing heuristics based on notification category and related entity
    try {
      const category = notification.category || '';
      const productId = notification.relatedEntity?._id;

      if (category === 'new_request' && productId) {
        // Navigate to seller requests page with the product ID in state
        // SellerRequests will auto-open requests for this product
        navigate('/seller/dashboard/requests', { state: { productId } });
      }else if (category==='request_accepted' && productId) {
        navigate(`/pending-transactions`);
      }else if (notification.relatedEntityModel === 'Products' && productId) {
        // console.log(notification);
        // Generic product notification -> go to product detail
        navigate(`/product/${productId}`);
      } else if (category.includes('chat') || category.includes('message')) {
        navigate('/chat');
      } else if (category.includes('order')) {
        navigate('/yourProducts');
      } else {
        // fallback to home
        navigate('/');
      }
    } catch (err) {
      console.warn('Navigation failed', err);
    }
    onClose && onClose();
  };

  const handleDelete = async (notification) => {
    if (!notification) return;
    const res = await deleteBackend(notification._id);
    if (res.success) {
      setNotifications(prev => prev.filter(n => n._id !== notification._id));
    }
  };

  return (
    <>
      <div
        className={`${classes.overlay} ${isOpen ? classes.overlayOpen : ''}`}
        onClick={onClose}
      ></div>

      <div className={`${classes.sidebar} ${isOpen ? classes.sidebarOpen : ''}`}>
        <div className={classes.header1}>
          <h2>Notifications</h2>
          <div className={classes.headerActions}>
            <button className={classes.markAllRead} onClick={handleMarkAllRead}>
              ✓ Mark All Read
            </button>
            <button className={classes.closeSidebar} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className={classes.notificationList}>
          {loading && (
            <div className={classes.loadingState}>
              <span>Loading notifications...</span>
            </div>
          )}
          
          {!loading && error && (
            <div className={classes.errorState}>{error}</div>
          )}
          
          {!loading && !error && notifications.length === 0 && (
            <div className={classes.emptyState}>
              <span className={classes.emptyIcon}>🔔</span>
              <span className={classes.emptyText}>No notifications yet</span>
            </div>
          )}

          {notifications.map(notification => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onOpen={handleOpenNotification}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationSidebar;