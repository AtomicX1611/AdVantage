# Notification System Documentation

## Overview
The AdVantage backend now includes a comprehensive notification system that follows the existing MVC architecture. This system tracks all important user activities and sends real-time notifications.

## Files Created

### 1. Model
- **`src/models/Notifications.js`**: Mongoose schema for notifications with the following fields:
  - `from`: Reference to the user who triggered the notification
  - `fromModel`: Type of sender (Users/Sellers/Admins/Managers)
  - `to`: Reference to the recipient user
  - `toModel`: Type of recipient (Users/Sellers/Admins/Managers)
  - `type`: Notification type (order_placed, payment_received, etc.)
  - `title`: Short notification title
  - `description`: Detailed notification message
  - `relatedEntityId`: Optional reference to related entity
  - `relatedEntityType`: Type of related entity (Product/Order/Payment/Message)
  - `isRead`: Boolean flag for read status
  - `readAt`: Timestamp when notification was read
  - `priority`: Notification priority (low/medium/high)
  - `createdAt`, `updatedAt`: Auto-generated timestamps

### 2. Data Access Layer (DAO)
- **`src/daos/notifications.dao.js`**: Database operations including:
  - `createNotificationDao()`: Create new notification
  - `getNotificationsByUserDao()`: Get all notifications for a user
  - `getUnreadNotificationsDao()`: Get unread notifications
  - `markNotificationAsReadDao()`: Mark single notification as read
  - `markAllNotificationsAsReadDao()`: Mark all as read
  - `deleteNotificationDao()`: Delete specific notification
  - `deleteReadNotificationsDao()`: Cleanup read notifications
  - `deleteAllNotificationsDao()`: Delete all user notifications
  - `getNotificationByIdDao()`: Get notification by ID
  - `getNotificationsCountDao()`: Get notification counts

### 3. Service Layer
- **`src/services/notification.service.js`**: Business logic for all notification operations

### 4. Controller
- **`src/controllers/notification.controller.js`**: Route handlers for notification endpoints

### 5. Routes
- **`src/routes/notification.router.js`**: API endpoints for notifications

### 6. Utilities
- **`src/utils/notificationHelper.js`**: Helper functions and notification templates

## API Endpoints

All endpoints require authentication via `checkToken` and `serializeUser` middleware.

### Base URL: `/notifications`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all notifications (paginated) |
| GET | `/unread` | Get unread notifications only |
| GET | `/count` | Get notification counts (total/unread/read) |
| GET | `/:notificationId` | Get specific notification by ID |
| PATCH | `/:notificationId/read` | Mark notification as read |
| PATCH | `/read/all` | Mark all notifications as read |
| DELETE | `/:notificationId` | Delete specific notification |
| DELETE | `/read/cleanup` | Delete all read notifications |
| DELETE | `/all/clear` | Delete all notifications |
| POST | `/create` | Create new notification (admin/internal use) |

### Query Parameters

#### GET `/`
- `limit`: Number of notifications to return (default: 50)
- `skip`: Number of notifications to skip for pagination (default: 0)

## Notification Types

The system supports the following notification types:

1. **order_placed**: When a buyer requests a product
2. **order_confirmed**: When seller accepts a request
3. **order_shipped**: Product shipped notification
4. **order_delivered**: Product delivered notification
5. **payment_received**: Payment confirmation for seller
6. **payment_failed**: Failed payment notification
7. **product_approved**: Product listing approved
8. **product_rejected**: Product listing rejected
9. **subscription_activated**: Subscription plan activated
10. **subscription_expired**: Subscription expired warning
11. **wishlist_price_drop**: Price drop on wishlisted items
12. **new_message**: New chat message received
13. **seller_approved**: Seller account approved
14. **seller_rejected**: Seller account rejected
15. **general**: General purpose notifications

## Automatic Cleanup

The notification system includes automatic cleanup:
- Read notifications are automatically deleted after 30 days (MongoDB TTL index)
- Manual cleanup available via `/notifications/read/cleanup` endpoint

## Integration Points

Notifications are automatically created in the following scenarios:

### 1. Product Requests
**File**: `src/services/buyer.service.js`
- When a buyer requests a product, seller receives notification

### 2. Request Accept/Reject
**File**: `src/services/seller.service.js`
- When seller accepts request, buyer receives notification
- When seller rejects request, buyer receives notification

### 3. Payments
**File**: `src/services/payment.service.js`
- Subscription activation notification
- Payment confirmation to seller

### 4. Messages
**File**: `src/services/chat.service.js`
- New message notifications to recipient

## Usage Examples

### Creating a Notification Programmatically

```javascript
import { createNotification, notificationTemplates } from "../utils/notificationHelper.js";

// Using predefined templates
const notifData = notificationTemplates.ORDER_PLACED(buyerName, productName);
await createNotification({
    fromId: buyerId,
    fromModel: 'Users',
    toId: sellerId,
    toModel: 'Users',
    type: notifData.type,
    title: notifData.title,
    description: notifData.description,
    relatedEntityId: productId,
    relatedEntityType: 'Product',
    priority: notifData.priority
});

// Custom notification
await createNotification({
    fromId: userId,
    fromModel: 'Users',
    toId: recipientId,
    toModel: 'Users',
    type: 'general',
    title: 'Custom Title',
    description: 'Custom description',
    priority: 'medium'
});
```

### Frontend Integration Example

```javascript
// Get all notifications
const response = await fetch('/notifications?limit=20&skip=0', {
    headers: { 'Authorization': `Bearer ${token}` }
});

// Get unread count
const countRes = await fetch('/notifications/count', {
    headers: { 'Authorization': `Bearer ${token}` }
});

// Mark as read
await fetch(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
});

// Delete notification
await fetch(`/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
});
```

## Database Indexes

The notification model includes optimized indexes:
- Compound index on `to`, `isRead`, `createdAt` for fast filtering
- Index on `from` and `createdAt` for sender queries
- TTL index on `readAt` for automatic cleanup

## Security

- All endpoints require authentication
- Users can only access their own notifications
- Role-based access through existing middleware
- Notifications are user-scoped to prevent unauthorized access

## Best Practices

1. **Priority Levels**:
   - `high`: Critical actions (payments, order confirmations)
   - `medium`: Important updates (product approved, subscription)
   - `low`: Informational (new messages)

2. **Cleanup**:
   - Encourage users to regularly clean read notifications
   - Automatic cleanup after 30 days for read notifications
   - Manual cleanup available via API

3. **Performance**:
   - Use pagination for large notification lists
   - Indexes optimize query performance
   - Limit query results to prevent overload

## Future Enhancements

Potential features to add:
- Push notifications (web/mobile)
- Email notifications for critical events
- Notification preferences/settings per user
- Bulk notification operations
- Notification categories/filtering
- Real-time notifications via Socket.IO

## Testing

To test the notification system:

1. **Create a product request**: Should notify seller
2. **Accept/reject request**: Should notify buyer
3. **Complete payment**: Should notify seller
4. **Send a message**: Should notify recipient
5. **Activate subscription**: Should notify user

## Troubleshooting

Common issues:
- **Notifications not appearing**: Check authentication and user model mapping
- **Duplicate notifications**: Ensure service functions aren't called multiple times
- **Performance issues**: Use pagination and cleanup old notifications
- **Missing notifications**: Check if notification creation is wrapped in try-catch

## Support

For issues or questions, check:
1. Console logs in service files
2. MongoDB connection status
3. Authentication middleware
4. User role mapping in `getUserModel()` helper
