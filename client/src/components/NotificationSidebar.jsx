import React, { useState } from 'react';
import classes from '../styles/header.module.css';
import NotificationCard from './NotificationCard';

const initialNotifications = [
  { id: 1, icon: '💬', title: 'New Message from John', message: 'Hi, I can offer $500 for the iPhone 14.', timestamp: '2 hours ago', unread: true },
  { id: 2, icon: '⚡', title: 'Price Drop Alert', message: 'The iPhone 14 price dropped by $100.', timestamp: '5 hours ago', unread: true },
];

const NotificationSidebar = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkAllRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n => ({ ...n, unread: false }))
    );
  };

  const handleDelete = (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(n => n.id !== id)
    );
  };

  return (
    <>
      <div
        className={`${classes.overlay} ${isOpen ? classes.overlayOpen : ''}`}
        onClick={onClose}
      ></div>

      {/* UPDATED: This is the main fix. */}
      {/* We apply .sidebar always, and .sidebarOpen only when isOpen is true. */}
      <div className={`${classes.sidebar} ${isOpen ? classes.sidebarOpen : ''}`}>
        <div className={classes.header1}>
          <h2>Notifications</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px' }}>
            {/* UPDATED: Replaced id with className */}
            <button className={classes.markAllRead} onClick={handleMarkAllRead}>
              Mark All as Read
            </button>
            {/* UPDATED: Replaced id with className */}
            <button className={classes.closeSidebar} onClick={onClose}>
              x
            </button>
          </div>
        </div>

        <div className={classes.notificationList}>
          {notifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onDelete={() => handleDelete(notification.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationSidebar;