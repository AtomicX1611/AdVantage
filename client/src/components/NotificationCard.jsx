import React from 'react';
import classes from '../styles/header.module.css';

const NotificationCard = ({ notification, onDelete }) => {
  return (
    <div className={`${classes.notificationCard} ${notification.unread ? classes.unread : ''}`}>
      <span className={classes.icon}>{notification.icon}</span>
      <div className={classes.content}>
        <h3>{notification.title}</h3>
        <p className={classes.messagePreview}>
          "{notification.message}"
        </p>
        <span className={classes.timestamp}>{notification.timestamp}</span>
      </div>
      <button className={classes.deleteBtn} onClick={onDelete}>
        Delete
      </button>
    </div>
  );
};

export default NotificationCard;