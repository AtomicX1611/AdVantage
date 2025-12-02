/**
 * NOTIFICATION SYSTEM - QUICK START GUIDE
 * ======================================
 * 
 * This file provides quick code snippets for common notification operations.
 * Copy and paste these into your components as needed.
 */

// ============================================================================
// 1. USING THE NOTIFICATION POLLING HOOK
// ============================================================================

import useNotificationPolling from '../hooks/useNotificationPolling';

function MyComponent() {
  // Auto-starts polling when user is authenticated
  // Default interval: 30 seconds
  useNotificationPolling();
  
  // Custom interval (60 seconds)
  useNotificationPolling(60000);
  
  // Disable polling temporarily
  useNotificationPolling(30000, false);
}


// ============================================================================
// 2. ACCESSING NOTIFICATION STATE
// ============================================================================

import { useSelector } from 'react-redux';

function MyComponent() {
  const { 
    notifications,    // Array of all notifications
    unreadCount,      // Number of unread notifications
    loading,          // Loading state
    error            // Error message if any
  } = useSelector((state) => state.notifications);
  
  return (
    <div>
      <h3>You have {unreadCount} unread notifications</h3>
      {notifications.map(notif => (
        <div key={notif._id}>{notif.title}</div>
      ))}
    </div>
  );
}


// ============================================================================
// 3. MANUALLY FETCHING NOTIFICATIONS
// ============================================================================

import { useDispatch } from 'react-redux';
import { notificationAPI } from '../services/notificationService';
import { setNotifications } from '../redux/notificationSlice';

function MyComponent() {
  const dispatch = useDispatch();
  
  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAllNotifications(50, 0);
      if (response.success) {
        dispatch(setNotifications({
          notifications: response.notifications,
          unreadCount: response.unreadCount,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };
  
  return <button onClick={fetchNotifications}>Refresh Notifications</button>;
}


// ============================================================================
// 4. MARKING NOTIFICATIONS AS READ
// ============================================================================

import { useDispatch } from 'react-redux';
import { notificationAPI } from '../services/notificationService';
import { markNotificationAsRead, markAllAsRead } from '../redux/notificationSlice';

function MyComponent() {
  const dispatch = useDispatch();
  
  // Mark single notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      dispatch(markNotificationAsRead(notificationId));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };
  
  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      dispatch(markAllAsRead());
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };
}


// ============================================================================
// 5. DELETING NOTIFICATIONS
// ============================================================================

import { useDispatch } from 'react-redux';
import { notificationAPI } from '../services/notificationService';
import { deleteNotification, deleteReadNotifications } from '../redux/notificationSlice';

function MyComponent() {
  const dispatch = useDispatch();
  
  // Delete single notification
  const handleDelete = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      dispatch(deleteNotification(notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };
  
  // Delete all read notifications
  const handleClearRead = async () => {
    if (window.confirm('Delete all read notifications?')) {
      try {
        await notificationAPI.deleteReadNotifications();
        dispatch(deleteReadNotifications());
      } catch (error) {
        console.error('Failed to clear read notifications:', error);
      }
    }
  };
}


// ============================================================================
// 6. NAVIGATING BASED ON NOTIFICATION TYPE
// ============================================================================

import { useNavigate } from 'react-router-dom';
import { getNotificationRoute } from '../utils/notificationUtils';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleNotificationClick = async (notification) => {
    // Get appropriate route based on notification type
    const route = getNotificationRoute(notification);
    
    // Navigate to the route
    navigate(route);
  };
  
  // Custom navigation logic
  const handleCustomNavigation = (notification) => {
    switch (notification.type) {
      case 'order_placed':
        navigate('/seller/dashboard/requests');
        break;
      case 'new_message':
        navigate(`/chat?userId=${notification.from._id}`);
        break;
      case 'payment_received':
        navigate('/pending-transactions');
        break;
      default:
        navigate('/');
    }
  };
}


// ============================================================================
// 7. FORMATTING NOTIFICATION DATA
// ============================================================================

import {
  formatRelativeTime,
  formatDateTime,
  getNotificationIcon,
  getPriorityClass,
} from '../utils/notificationUtils';

function NotificationItem({ notification }) {
  const icon = getNotificationIcon(notification.type);
  const relativeTime = formatRelativeTime(notification.createdAt);
  const fullDateTime = formatDateTime(notification.createdAt);
  const priorityClass = getPriorityClass(notification.priority);
  
  return (
    <div className={`notification ${priorityClass}`}>
      <span>{icon}</span>
      <div>
        <h4>{notification.title}</h4>
        <p>{notification.description}</p>
        <small title={fullDateTime}>{relativeTime}</small>
      </div>
    </div>
  );
}


// ============================================================================
// 8. FILTERING NOTIFICATIONS
// ============================================================================

import { filterNotifications } from '../utils/notificationUtils';
import { useSelector } from 'react-redux';

function NotificationList() {
  const { notifications } = useSelector((state) => state.notifications);
  const [filter, setFilter] = useState('all');
  
  // Get filtered notifications
  const filteredNotifications = filterNotifications(notifications, filter);
  
  return (
    <div>
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('unread')}>Unread</button>
        <button onClick={() => setFilter('read')}>Read</button>
      </div>
      
      {filteredNotifications.map(notif => (
        <div key={notif._id}>{notif.title}</div>
      ))}
    </div>
  );
}


// ============================================================================
// 9. GROUPING NOTIFICATIONS BY DATE
// ============================================================================

import { groupNotificationsByDate } from '../utils/notificationUtils';

function GroupedNotifications() {
  const { notifications } = useSelector((state) => state.notifications);
  const grouped = groupNotificationsByDate(notifications);
  
  return (
    <div>
      {grouped.today.length > 0 && (
        <div>
          <h3>Today</h3>
          {grouped.today.map(notif => <div key={notif._id}>{notif.title}</div>)}
        </div>
      )}
      
      {grouped.yesterday.length > 0 && (
        <div>
          <h3>Yesterday</h3>
          {grouped.yesterday.map(notif => <div key={notif._id}>{notif.title}</div>)}
        </div>
      )}
      
      {grouped.thisWeek.length > 0 && (
        <div>
          <h3>This Week</h3>
          {grouped.thisWeek.map(notif => <div key={notif._id}>{notif.title}</div>)}
        </div>
      )}
      
      {grouped.older.length > 0 && (
        <div>
          <h3>Older</h3>
          {grouped.older.map(notif => <div key={notif._id}>{notif.title}</div>)}
        </div>
      )}
    </div>
  );
}


// ============================================================================
// 10. DISPLAYING UNREAD COUNT BADGE
// ============================================================================

import { useSelector } from 'react-redux';

function NotificationBell() {
  const { unreadCount } = useSelector((state) => state.notifications);
  
  return (
    <div className="notification-bell" style={{ position: 'relative' }}>
      <i className="bx bx-bell"></i>
      {unreadCount > 0 && (
        <span className="badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
}


// ============================================================================
// 11. COMPLETE NOTIFICATION CARD COMPONENT
// ============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { notificationAPI } from '../services/notificationService';
import { markNotificationAsRead, deleteNotification } from '../redux/notificationSlice';
import {
  getNotificationIcon,
  getNotificationRoute,
  formatRelativeTime,
  getPriorityClass,
} from '../utils/notificationUtils';

function CompleteNotificationCard({ notification, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleClick = async () => {
    try {
      // Mark as read if unread
      if (!notification.isRead) {
        await notificationAPI.markAsRead(notification._id);
        dispatch(markNotificationAsRead(notification._id));
      }
      
      // Close sidebar if provided
      if (onClose) onClose();
      
      // Navigate to appropriate page
      const route = getNotificationRoute(notification);
      navigate(route);
    } catch (error) {
      console.error('Error handling notification:', error);
      // Navigate anyway
      if (onClose) onClose();
      navigate(getNotificationRoute(notification));
    }
  };
  
  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await notificationAPI.deleteNotification(notification._id);
      dispatch(deleteNotification(notification._id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification');
    }
  };
  
  const icon = getNotificationIcon(notification.type);
  const priorityClass = getPriorityClass(notification.priority);
  const relativeTime = formatRelativeTime(notification.createdAt);
  
  return (
    <div
      className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <span className="icon">{icon}</span>
      <div className="content">
        <div className="header">
          <h3>{notification.title}</h3>
          <span className={`priority-badge ${priorityClass}`}>
            {notification.priority}
          </span>
        </div>
        <p>{notification.description}</p>
        <div className="footer">
          <span className="timestamp">{relativeTime}</span>
          {notification.from && (
            <span className="sender">from {notification.from.username}</span>
          )}
        </div>
      </div>
      <button onClick={handleDelete} className="delete-btn">✕</button>
    </div>
  );
}


// ============================================================================
// 12. CREATING CUSTOM NOTIFICATION LISTENERS
// ============================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

function useNotificationListener(notificationType, callback) {
  const { notifications } = useSelector((state) => state.notifications);
  
  useEffect(() => {
    // Find new notifications of specified type
    const newNotifications = notifications.filter(
      n => n.type === notificationType && !n.isRead
    );
    
    if (newNotifications.length > 0) {
      callback(newNotifications);
    }
  }, [notifications, notificationType]);
}

// Usage example:
function MyComponent() {
  useNotificationListener('new_message', (messages) => {
    console.log('New messages received:', messages);
    // Play sound, show toast, etc.
  });
  
  useNotificationListener('payment_received', (payments) => {
    console.log('New payments received:', payments);
    // Update payment list, show celebration, etc.
  });
}


// ============================================================================
// 13. EXPORTING FOR USE IN OTHER FILES
// ============================================================================

export {
  // Hooks
  useNotificationPolling,
  useNotificationListener,
  
  // Services
  notificationAPI,
  
  // Utils
  getNotificationRoute,
  getNotificationIcon,
  formatRelativeTime,
  formatDateTime,
  getPriorityClass,
  groupNotificationsByDate,
  filterNotifications,
  
  // Redux Actions
  setNotifications,
  setUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  clearNotifications,
};


// ============================================================================
// END OF QUICK START GUIDE
// ============================================================================
