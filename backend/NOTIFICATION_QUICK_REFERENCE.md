# Notification System - Quick Reference

## API Endpoints Summary

| Method | Endpoint | Response Fields |
|--------|----------|----------------|
| GET | `/notifications?limit=50&skip=0` | `{ success, message, notifications[], unreadCount }` |
| GET | `/notifications/unread` | `{ success, message, notifications[], count }` |
| GET | `/notifications/count` | `{ success, message, totalCount, unreadCount, readCount }` |
| GET | `/notifications/:id` | `{ success, message, notification }` |
| PATCH | `/notifications/:id/read` | `{ success, message, notification }` |
| PATCH | `/notifications/read/all` | `{ success, message, modifiedCount }` |
| DELETE | `/notifications/:id` | `{ success, message }` |
| DELETE | `/notifications/read/cleanup` | `{ success, message, deletedCount }` |

## Notification Object Structure

```typescript
interface Notification {
  _id: string;
  from: {
    _id: string;
    username: string;
    email: string;
  };
  fromModel: 'Users' | 'Sellers' | 'Admins' | 'Managers';
  to: string;
  toModel: 'Users' | 'Sellers' | 'Admins' | 'Managers';
  type: NotificationType;
  title: string;
  description: string;
  relatedEntityId?: string | null;
  relatedEntityType?: 'Product' | 'Order' | 'Payment' | 'Message' | null;
  isRead: boolean;
  readAt?: string | null;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}
```

## Notification Types

```typescript
type NotificationType = 
  | 'order_placed'           // Seller receives when buyer requests product
  | 'order_confirmed'        // Buyer receives when seller accepts
  | 'order_shipped'          // Buyer receives when product ships
  | 'order_delivered'        // Buyer receives when delivered
  | 'payment_received'       // Seller receives on payment
  | 'payment_failed'         // Buyer receives on failed payment
  | 'product_approved'       // Seller receives from admin
  | 'product_rejected'       // Seller receives from admin
  | 'subscription_activated' // User receives on subscription
  | 'subscription_expired'   // User receives on expiry
  | 'wishlist_price_drop'    // Buyer receives on price change
  | 'new_message'           // Recipient receives on new message
  | 'seller_approved'       // Seller receives from admin
  | 'seller_rejected'       // Seller receives from admin
  | 'general';              // General purpose
```

## User Object (Redux Store)

```typescript
interface User {
  _id: string;
  username: string;
  email: string;
  contact: string;
  role: 'user' | 'seller' | 'admin' | 'manager';
  profilePicPath: string;
  subscription: 0 | 1 | 2; // 0: Free, 1: Basic, 2: Premium
  wishlistProducts: string[];
  isAuthenticated: boolean;
}
```

## Navigation Routes by Notification Type

```javascript
const routes = {
  order_placed: '/seller/requests',
  order_confirmed: '/buyer/pending-requests',
  order_rejected: '/products/:relatedEntityId',
  payment_received: '/seller/transactions',
  payment_failed: '/payments',
  product_approved: '/seller/products/:relatedEntityId',
  product_rejected: '/seller/products',
  subscription_activated: '/profile/subscription',
  subscription_expired: '/pricing',
  wishlist_price_drop: '/products/:relatedEntityId',
  new_message: '/chat/:fromUserId',
  general: '/notifications'
};
```

## Quick Integration Code

```javascript
// Fetch notifications
const { data } = await axios.get('/notifications?limit=20&skip=0', {
  withCredentials: true
});

// Get unread count
const { data: { unreadCount } } = await axios.get('/notifications/count', {
  withCredentials: true
});

// Mark as read
await axios.patch(`/notifications/${id}/read`, {}, {
  withCredentials: true
});

// Delete notification
await axios.delete(`/notifications/${id}`, {
  withCredentials: true
});
```

## Real-time Update (Socket.IO - Future Enhancement)

```javascript
// Listen for new notifications
socket.on('new_notification', (notification) => {
  dispatch(addNotification(notification));
  showToast(notification.title);
});

// Update notification count
socket.on('notification_read', ({ notificationId }) => {
  dispatch(markNotificationRead(notificationId));
});
```

## Polling Strategy (Current Implementation)

```javascript
// Poll every 30 seconds when user is active
useEffect(() => {
  const interval = setInterval(async () => {
    const { data } = await notificationAPI.getNotificationCount();
    dispatch(updateUnreadCount(data.unreadCount));
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

## Error Handling

```javascript
try {
  const response = await notificationAPI.getAllNotifications();
  setNotifications(response.notifications);
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
    navigate('/login');
  } else {
    showError('Failed to fetch notifications');
  }
}
```
