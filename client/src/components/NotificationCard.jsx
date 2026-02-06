import React from 'react';
import classes from '../styles/header.module.css';

const NotificationCard = ({ notification, onDelete, onOpen }) => {
  const isRead = notification.isRead || notification.readAt || false;

  // Get icon based on notification category
  const getIcon = () => {
    const category = notification.category || '';
    if (category.includes('chat') || category.includes('message')) return '💬';
    if (category.includes('request')) return '📩';
    if (category.includes('price')) return '💰';
    if (category.includes('order')) return '📦';
    if (notification.sender?.username) {
      return notification.sender.username[0].toUpperCase();
    }
    return '🔔';
  };

  // Format time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`${classes.notificationCard} ${!isRead ? classes.unread : ''}`}
      onClick={() => onOpen && onOpen(notification)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen && onOpen(notification); }}
    >
      <span className={classes.icon}>{getIcon()}</span>
      <div className={classes.content}>
        <h3>{notification.title}</h3>
        <p className={classes.messagePreview}>
          {notification.message}
        </p>
        <span className={classes.timestamp}>{getTimeAgo(notification.createdAt)}</span>
      </div>
      <div className={classes.cardActions}>
        <button className={classes.viewBtn} onClick={(e) => { e.stopPropagation(); onOpen && onOpen(notification); }}>
          View
        </button>
        <button className={classes.deleteBtn} onClick={(e) => { e.stopPropagation(); onDelete && onDelete(notification); }}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;