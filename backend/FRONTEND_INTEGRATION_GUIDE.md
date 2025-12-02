# Notification System - Frontend Integration Guide

## Backend API Response Structures

### 1. GET `/notifications` - Get All Notifications

**Request:**
```javascript
GET /notifications?limit=50&skip=0
Headers: {
  Cookie: "token=..." // or Authorization header
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "notifications": [
    {
      "_id": "674e8a9f1234567890abcdef",
      "from": {
        "_id": "674e8a9f1234567890abc123",
        "username": "john_seller",
        "email": "john@example.com"
      },
      "fromModel": "Users",
      "to": "674e8a9f1234567890abc456",
      "toModel": "Users",
      "type": "order_placed",
      "title": "New Order Placed",
      "description": "john_buyer has placed an order for iPhone 13 Pro",
      "relatedEntityId": "674e8a9f1234567890prod01",
      "relatedEntityType": "Product",
      "isRead": false,
      "readAt": null,
      "priority": "high",
      "createdAt": "2025-12-02T10:30:00.000Z",
      "updatedAt": "2025-12-02T10:30:00.000Z"
    },
    {
      "_id": "674e8a9f1234567890abcdeg",
      "from": {
        "_id": "674e8a9f1234567890abc789",
        "username": "admin_user",
        "email": "admin@example.com"
      },
      "fromModel": "Admins",
      "to": "674e8a9f1234567890abc456",
      "toModel": "Users",
      "type": "subscription_activated",
      "title": "Subscription Activated",
      "description": "Your Premium subscription has been activated successfully",
      "relatedEntityId": "674e8a9f1234567890pay001",
      "relatedEntityType": "Payment",
      "isRead": true,
      "readAt": "2025-12-02T11:00:00.000Z",
      "priority": "medium",
      "createdAt": "2025-12-02T09:00:00.000Z",
      "updatedAt": "2025-12-02T11:00:00.000Z"
    }
  ],
  "unreadCount": 5
}
```

**Query Parameters:**
- `limit` (optional, default: 50) - Number of notifications to return
- `skip` (optional, default: 0) - Number of notifications to skip (for pagination)

---

### 2. GET `/notifications/unread` - Get Unread Notifications Only

**Request:**
```javascript
GET /notifications/unread
Headers: {
  Cookie: "token=..." // or Authorization header
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Unread notifications fetched successfully",
  "notifications": [
    {
      "_id": "674e8a9f1234567890abcdef",
      "from": {
        "_id": "674e8a9f1234567890abc123",
        "username": "john_seller",
        "email": "john@example.com"
      },
      "fromModel": "Users",
      "to": "674e8a9f1234567890abc456",
      "toModel": "Users",
      "type": "order_confirmed",
      "title": "Request Accepted",
      "description": "Your request for iPhone 13 Pro has been accepted",
      "relatedEntityId": "674e8a9f1234567890prod01",
      "relatedEntityType": "Product",
      "isRead": false,
      "readAt": null,
      "priority": "high",
      "createdAt": "2025-12-02T10:30:00.000Z",
      "updatedAt": "2025-12-02T10:30:00.000Z"
    },
    {
      "_id": "674e8a9f1234567890abcdeh",
      "from": {
        "_id": "674e8a9f1234567890abc789",
        "username": "jane_buyer",
        "email": "jane@example.com"
      },
      "fromModel": "Users",
      "to": "674e8a9f1234567890abc456",
      "toModel": "Users",
      "type": "new_message",
      "title": "New Message",
      "description": "You have a new message from jane_buyer",
      "relatedEntityId": null,
      "relatedEntityType": "Message",
      "isRead": false,
      "readAt": null,
      "priority": "low",
      "createdAt": "2025-12-02T12:00:00.000Z",
      "updatedAt": "2025-12-02T12:00:00.000Z"
    }
  ],
  "count": 2
}
```

---

### 3. GET `/notifications/count` - Get Notification Counts

**Request:**
```javascript
GET /notifications/count
Headers: {
  Cookie: "token=..." // or Authorization header
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notifications count fetched successfully",
  "totalCount": 15,
  "unreadCount": 5,
  "readCount": 10
}
```

---

### 4. PATCH `/notifications/:notificationId/read` - Mark as Read

**Request:**
```javascript
PATCH /notifications/674e8a9f1234567890abcdef/read
Headers: {
  Cookie: "token=..." // or Authorization header
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": {
    "_id": "674e8a9f1234567890abcdef",
    "from": "674e8a9f1234567890abc123",
    "fromModel": "Users",
    "to": "674e8a9f1234567890abc456",
    "toModel": "Users",
    "type": "order_placed",
    "title": "New Order Placed",
    "description": "john_buyer has placed an order for iPhone 13 Pro",
    "relatedEntityId": "674e8a9f1234567890prod01",
    "relatedEntityType": "Product",
    "isRead": true,
    "readAt": "2025-12-02T14:30:00.000Z",
    "priority": "high",
    "createdAt": "2025-12-02T10:30:00.000Z",
    "updatedAt": "2025-12-02T14:30:00.000Z"
  }
}
```

---

### 5. DELETE `/notifications/:notificationId` - Delete Notification

**Request:**
```javascript
DELETE /notifications/674e8a9f1234567890abcdef
Headers: {
  Cookie: "token=..." // or Authorization header
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## User Object Structure (from Auth Endpoints)

### Login Response - `POST /auth/buyerLogin`

```json
{
  "success": true,
  "message": "Buyer login successful",
  "buyerId": "674e8a9f1234567890abc456",
  "email": "user@example.com"
}
```

**Note:** The JWT token is set in an HTTP-only cookie named `token`.

**JWT Token Payload:**
```javascript
{
  "_id": "674e8a9f1234567890abc456",
  "role": "user",  // Can be: "user", "seller", "admin", "manager"
  "iat": 1733140800,
  "exp": 1733745600
}
```

### User Profile Response - `GET /user/getYourProfile`

```json
{
  "success": true,
  "message": "profile fetched successfully",
  "status": 200,
  "buyer": {
    "_id": "674e8a9f1234567890abc456",
    "username": "john_doe",
    "contact": "+1234567890",
    "email": "john@example.com",
    "profilePicPath": "uploads/profilePics/john_doe.jpg",
    "subscription": 1,  // 0: Free, 1: Basic, 2: Premium
    "wishlistProducts": [
      "674e8a9f1234567890prod01",
      "674e8a9f1234567890prod02"
    ],
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-12-02T14:00:00.000Z"
  }
}
```

### Suggested Redux User State Structure

```javascript
// Redux State
{
  user: {
    _id: "674e8a9f1234567890abc456",
    username: "john_doe",
    email: "john@example.com",
    contact: "+1234567890",
    role: "user", // Extracted from JWT or set during login
    profilePicPath: "uploads/profilePics/john_doe.jpg",
    subscription: 1,
    wishlistProducts: ["674e8a9f1234567890prod01"],
    isAuthenticated: true,
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Optional, if not using HTTP-only cookies
  }
}
```

---

## Notification Types and Navigation Routes

### Notification Type to Route Mapping

| Notification Type | Frontend Route | Additional Data Needed |
|------------------|----------------|------------------------|
| `order_placed` | `/seller/requests` or `/products/:relatedEntityId` | Navigate to seller's request management |
| `order_confirmed` | `/buyer/pending-requests` or `/products/:relatedEntityId` | Show accepted product details |
| `order_rejected` | `/buyer/requests` or `/products/:relatedEntityId` | Show rejected request |
| `payment_received` | `/seller/transactions` or `/products/:relatedEntityId` | Show payment details |
| `payment_failed` | `/buyer/payments` | Show failed payment details |
| `product_approved` | `/seller/products/:relatedEntityId` | Show approved product |
| `product_rejected` | `/seller/products` | Show products list with rejection reason |
| `subscription_activated` | `/profile/subscription` | Show subscription details |
| `subscription_expired` | `/pricing` or `/profile/subscription` | Prompt to renew |
| `wishlist_price_drop` | `/products/:relatedEntityId` | Show product with new price |
| `new_message` | `/chat/:fromUserId` | Open chat with sender |
| `general` | Based on `relatedEntityType` | Context-dependent |

### Detailed Navigation Logic

```javascript
// notificationNavigation.js
export const getNotificationRoute = (notification) => {
  const { type, relatedEntityId, relatedEntityType, from } = notification;

  switch (type) {
    // BUYER RECEIVES
    case 'order_confirmed':
    case 'request_accepted':
      return `/buyer/pending-requests`; // or `/products/${relatedEntityId}`
    
    case 'order_rejected':
    case 'request_rejected':
      return `/products/${relatedEntityId}`;
    
    case 'subscription_activated':
      return `/profile/subscription`;
    
    case 'subscription_expired':
      return `/pricing`;
    
    case 'wishlist_price_drop':
      return `/products/${relatedEntityId}`;

    // SELLER RECEIVES
    case 'order_placed':
      return `/seller/requests`; // or `/products/${relatedEntityId}/requests`
    
    case 'payment_received':
      return `/seller/transactions`;
    
    case 'product_approved':
      return `/seller/products/${relatedEntityId}`;
    
    case 'product_rejected':
      return `/seller/products`;

    // BOTH
    case 'new_message':
      return `/chat/${from._id}`;
    
    case 'payment_failed':
      return `/payments`;

    // GENERAL
    case 'general':
      if (relatedEntityType === 'Product') {
        return `/products/${relatedEntityId}`;
      }
      if (relatedEntityType === 'Payment') {
        return `/payments`;
      }
      return '/notifications'; // Default to notifications page

    default:
      return '/notifications';
  }
};

// Usage in React component
const handleNotificationClick = async (notification) => {
  // Mark as read
  await markNotificationAsRead(notification._id);
  
  // Navigate to appropriate route
  const route = getNotificationRoute(notification);
  navigate(route);
};
```

### Notification Click Handler Example

```javascript
// NotificationItem.jsx
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { markAsRead } from '../api/notifications';

const NotificationItem = ({ notification }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = async () => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await markAsRead(notification._id);
        dispatch(updateNotificationStatus(notification._id));
      }

      // Navigate based on type
      const route = getNotificationRoute(notification);
      navigate(route);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  return (
    <div 
      className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
      onClick={handleClick}
    >
      <div className="notification-header">
        <h4>{notification.title}</h4>
        <span className={`priority-badge ${notification.priority}`}>
          {notification.priority}
        </span>
      </div>
      <p>{notification.description}</p>
      <span className="timestamp">
        {new Date(notification.createdAt).toLocaleString()}
      </span>
    </div>
  );
};
```

---

## Complete Notification Object Example

```javascript
// Example 1: Order Placed Notification (Seller receives)
{
  "_id": "674e8a9f1234567890abcdef",
  "from": {
    "_id": "674e8a9f1234567890buyer01",
    "username": "jane_buyer",
    "email": "jane@example.com"
  },
  "fromModel": "Users",
  "to": "674e8a9f1234567890seller1",
  "toModel": "Users",
  "type": "order_placed",
  "title": "New Order Placed",
  "description": "jane_buyer has placed an order for iPhone 13 Pro",
  "relatedEntityId": "674e8a9f1234567890prod01",
  "relatedEntityType": "Product",
  "isRead": false,
  "readAt": null,
  "priority": "high",
  "createdAt": "2025-12-02T10:30:00.000Z",
  "updatedAt": "2025-12-02T10:30:00.000Z"
}

// Example 2: Request Accepted Notification (Buyer receives)
{
  "_id": "674e8a9f1234567890abcdeg",
  "from": {
    "_id": "674e8a9f1234567890seller1",
    "username": "john_seller",
    "email": "john@example.com"
  },
  "fromModel": "Users",
  "to": "674e8a9f1234567890buyer01",
  "toModel": "Users",
  "type": "order_confirmed",
  "title": "Request Accepted",
  "description": "Your request for iPhone 13 Pro has been accepted",
  "relatedEntityId": "674e8a9f1234567890prod01",
  "relatedEntityType": "Product",
  "isRead": false,
  "readAt": null,
  "priority": "high",
  "createdAt": "2025-12-02T11:00:00.000Z",
  "updatedAt": "2025-12-02T11:00:00.000Z"
}

// Example 3: Payment Received Notification (Seller receives)
{
  "_id": "674e8a9f1234567890abcdeh",
  "from": {
    "_id": "674e8a9f1234567890buyer01",
    "username": "jane_buyer",
    "email": "jane@example.com"
  },
  "fromModel": "Users",
  "to": "674e8a9f1234567890seller1",
  "toModel": "Users",
  "type": "payment_received",
  "title": "Payment Received",
  "description": "Payment of ₹15000 received from jane_buyer",
  "relatedEntityId": "674e8a9f1234567890prod01",
  "relatedEntityType": "Payment",
  "isRead": false,
  "readAt": null,
  "priority": "high",
  "createdAt": "2025-12-02T12:00:00.000Z",
  "updatedAt": "2025-12-02T12:00:00.000Z"
}

// Example 4: New Message Notification
{
  "_id": "674e8a9f1234567890abcdei",
  "from": {
    "_id": "674e8a9f1234567890user123",
    "username": "alice_user",
    "email": "alice@example.com"
  },
  "fromModel": "Users",
  "to": "674e8a9f1234567890user456",
  "toModel": "Users",
  "type": "new_message",
  "title": "New Message",
  "description": "You have a new message from alice_user",
  "relatedEntityId": null,
  "relatedEntityType": "Message",
  "isRead": false,
  "readAt": null,
  "priority": "low",
  "createdAt": "2025-12-02T13:00:00.000Z",
  "updatedAt": "2025-12-02T13:00:00.000Z"
}

// Example 5: Subscription Activated
{
  "_id": "674e8a9f1234567890abcdej",
  "from": {
    "_id": "674e8a9f1234567890user456",
    "username": "bob_user",
    "email": "bob@example.com"
  },
  "fromModel": "Users",
  "to": "674e8a9f1234567890user456",
  "toModel": "Users",
  "type": "subscription_activated",
  "title": "Subscription Activated",
  "description": "Your Premium subscription has been activated successfully",
  "relatedEntityId": "674e8a9f1234567890pay001",
  "relatedEntityType": "Payment",
  "isRead": false,
  "readAt": null,
  "priority": "medium",
  "createdAt": "2025-12-02T14:00:00.000Z",
  "updatedAt": "2025-12-02T14:00:00.000Z"
}
```

---

## Frontend API Service Example

```javascript
// services/notificationService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Your backend URL

export const notificationAPI = {
  // Get all notifications
  getAllNotifications: async (limit = 50, skip = 0) => {
    const response = await axios.get(
      `${API_BASE_URL}/notifications?limit=${limit}&skip=${skip}`,
      { withCredentials: true }
    );
    return response.data;
  },

  // Get unread notifications
  getUnreadNotifications: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/notifications/unread`,
      { withCredentials: true }
    );
    return response.data;
  },

  // Get notification count
  getNotificationCount: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/notifications/count`,
      { withCredentials: true }
    );
    return response.data;
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    const response = await axios.patch(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await axios.patch(
      `${API_BASE_URL}/notifications/read/all`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/notifications/${notificationId}`,
      { withCredentials: true }
    );
    return response.data;
  },

  // Delete all read notifications
  deleteReadNotifications: async () => {
    const response = await axios.delete(
      `${API_BASE_URL}/notifications/read/cleanup`,
      { withCredentials: true }
    );
    return response.data;
  }
};
```

---

## Priority Badge Styling

```css
.priority-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.high {
  background-color: #fee;
  color: #c00;
}

.priority-badge.medium {
  background-color: #ffc;
  color: #860;
}

.priority-badge.low {
  background-color: #eef;
  color: #06c;
}

.notification-item.unread {
  background-color: #f0f8ff;
  border-left: 4px solid #007bff;
  font-weight: 600;
}
```
