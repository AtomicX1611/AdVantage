import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classes from '../styles/header.module.css';
import NotificationCard from './NotificationCard';
import { notificationAPI } from '../services/notificationService';
import {
  setNotifications,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  setLoading,
  setError,
} from '../redux/notificationSlice';
import { filterNotifications } from '../utils/notificationUtils';

const NotificationSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const [filterType, setFilterType] = useState('all'); // all, unread, read
  const [deletingAll, setDeletingAll] = useState(false);

  // Fetch notifications when sidebar opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      dispatch(setLoading(true));
      const response = await notificationAPI.getAllNotifications(50, 0);
      if (response.success) {
        dispatch(setNotifications({
          notifications: response.notifications,
          unreadCount: response.unreadCount,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      dispatch(setError(error.message || 'Failed to fetch notifications'));
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    try {
      const response = await notificationAPI.markAllAsRead();
      if (response.success) {
        dispatch(markAllAsRead());
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      alert('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const response = await notificationAPI.deleteNotification(notificationId);
      if (response.success) {
        dispatch(deleteNotification(notificationId));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      alert('Failed to delete notification');
    }
  };

  const handleClearRead = async () => {
    if (window.confirm('Are you sure you want to delete all read notifications?')) {
      setDeletingAll(true);
      try {
        const response = await notificationAPI.deleteReadNotifications();
        if (response.success) {
          dispatch(deleteReadNotifications());
        }
      } catch (error) {
        console.error('Failed to clear read notifications:', error);
        alert('Failed to clear read notifications');
      } finally {
        setDeletingAll(false);
      }
    }
  };

  // Filter notifications based on selected filter
  const filteredNotifications = filterNotifications(notifications, filterType);

  return (
    <>
      <div
        className={`${classes.overlay} ${isOpen ? classes.overlayOpen : ''}`}
        onClick={onClose}
      ></div>

      <div className={`${classes.sidebar} ${isOpen ? classes.sidebarOpen : ''}`}>
        <div className={classes.header1}>
          <h2>Notifications {unreadCount > 0 && <span className={classes.unreadBadge}>({unreadCount})</span>}</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className={classes.markAllRead} 
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              style={{ opacity: unreadCount === 0 ? 0.5 : 1 }}
            >
              Mark All as Read
            </button>
            <button 
              className={classes.clearReadBtn} 
              onClick={handleClearRead}
              disabled={deletingAll}
            >
              {deletingAll ? 'Clearing...' : 'Clear Read'}
            </button>
            <button className={classes.closeSidebar} onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Filter Tabs */}
          <div className={classes.filterTabs}>
            <button
              className={`${classes.filterTab} ${filterType === 'all' ? classes.activeFilter : ''}`}
              onClick={() => setFilterType('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={`${classes.filterTab} ${filterType === 'unread' ? classes.activeFilter : ''}`}
              onClick={() => setFilterType('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`${classes.filterTab} ${filterType === 'read' ? classes.activeFilter : ''}`}
              onClick={() => setFilterType('read')}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        <div className={classes.notificationList}>
          {loading ? (
            <div className={classes.loadingContainer}>
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className={classes.emptyNotifications}>
              <p>
                {filterType === 'all' 
                  ? 'No notifications yet' 
                  : filterType === 'unread' 
                  ? 'No unread notifications' 
                  : 'No read notifications'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                onDelete={() => handleDelete(notification._id)}
                onClose={onClose}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationSidebar;