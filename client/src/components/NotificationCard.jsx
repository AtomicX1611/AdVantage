import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classes from '../styles/header.module.css';
import { notificationAPI } from '../services/notificationService';
import { markNotificationAsRead } from '../redux/notificationSlice';
import {
  getNotificationIcon,
  getNotificationRoute,
  formatRelativeTime,
  getPriorityClass,
} from '../utils/notificationUtils';

const NotificationCard = ({ notification, onDelete, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNotificationClick = async () => {
    try {
      // Mark as read if unread
      if (!notification.isRead) {
        await notificationAPI.markAsRead(notification._id);
        dispatch(markNotificationAsRead(notification._id));
      }

      // Close the sidebar
      if (onClose) {
        onClose();
      }

      // Navigate to appropriate route
      const route = getNotificationRoute(notification);
      navigate(route);
    } catch (error) {
      console.error('Error handling notification click:', error);
      // Still navigate even if marking as read fails
      if (onClose) onClose();
      const route = getNotificationRoute(notification);
      navigate(route);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent triggering the notification click
    if (onDelete) {
      onDelete();
    }
  };

  const icon = getNotificationIcon(notification.type);
  const priorityClass = getPriorityClass(notification.priority);
  const relativeTime = formatRelativeTime(notification.createdAt);

  return (
    <div
      className={`${classes.notificationCard} ${notification.isRead ? '' : classes.unread}`}
      onClick={handleNotificationClick}
      style={{ cursor: 'pointer' }}
    >
      <span className={classes.icon}>{icon}</span>
      <div className={classes.content}>
        <div className={classes.notificationHeader}>
          <h3>{notification.title}</h3>
          <span className={`${classes.priorityBadge} ${classes[priorityClass]}`}>
            {notification.priority}
          </span>
        </div>
        <p className={classes.messagePreview}>
          {notification.description}
        </p>
        <div className={classes.notificationFooter}>
          <span className={classes.timestamp}>{relativeTime}</span>
          {notification.from && (
            <span className={classes.sender}>
              from {notification.from.username || notification.from.email}
            </span>
          )}
        </div>
      </div>
      <button
        className={classes.deleteBtn}
        onClick={handleDelete}
        title="Delete notification"
      >
        ✕
      </button>
    </div>
  );
};

export default NotificationCard;