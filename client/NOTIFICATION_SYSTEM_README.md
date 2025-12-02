# Notification System - Frontend Implementation

## Overview
This is the complete frontend implementation of the polling-based notification system for AdVantage. The system provides real-time notification updates through periodic polling, displays unread counts, and enables navigation to relevant pages based on notification types.

## 🎯 Features

- ✅ **Polling-based Updates**: Automatic fetching of new notifications every 30 seconds
- ✅ **Unread Count Badge**: Visual indicator on notification bell icon
- ✅ **Priority Badges**: High/Medium/Low priority visual indicators
- ✅ **Smart Navigation**: Click notifications to navigate to relevant pages
- ✅ **Mark as Read**: Single and bulk mark-as-read functionality
- ✅ **Filtering**: Filter by All, Unread, or Read notifications
- ✅ **Delete Actions**: Delete individual or all read notifications
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Redux Integration**: Centralized state management

## 📁 Files Created/Modified

### New Files Created:
1. **`src/redux/notificationSlice.js`** - Redux state management
2. **`src/services/notificationService.js`** - API service layer
3. **`src/utils/notificationUtils.js`** - Helper functions and navigation logic
4. **`src/hooks/useNotificationPolling.js`** - Custom polling hook

### Modified Files:
1. **`src/components/NotificationSidebar.jsx`** - Enhanced with backend integration
2. **`src/components/NotificationCard.jsx`** - Added navigation and interaction
3. **`src/components/Header.jsx`** - Added polling and unread badge
4. **`src/redux/store.js`** - Added notification reducer
5. **`src/config/api.config.js`** - Added notification endpoints
6. **`src/styles/Header.module.css`** - Added notification styles

## 🚀 Usage

### Polling is Automatic
The notification system starts polling automatically when a user is authenticated. No manual setup required!

### Accessing Notifications
Users can click the bell icon in the header to open the notification sidebar.

### Navigation Routes
Clicking on a notification will navigate to the appropriate page based on the notification type:

| Notification Type | Navigates To |
|-------------------|--------------|
| `order_placed` | `/seller/dashboard/requests` |
| `order_confirmed` | `/product-requests` |
| `order_rejected` | `/product/:id` |
| `payment_received` | `/pending-transactions` |
| `product_approved` | `/product/:id` |
| `new_message` | `/chat?userId=:id` |
| `subscription_activated` | `/profile` |
| `wishlist_price_drop` | `/product/:id` |

## 🔧 Configuration

### Polling Interval
Default: 30 seconds (30000ms)

To change the polling interval, modify the constant in `Header.jsx`:
```javascript
const POLLING_INTERVAL = 30000; // Change to desired milliseconds
```

### Backend URL
Set your backend URL in `.env` file:
```env
VITE_BACKEND_URL=http://localhost:3000
```

## 🎨 UI Components

### Notification Badge
- Shows unread count on bell icon
- Red badge with white text
- Displays "99+" for counts over 99

### Notification Card
- Icon based on notification type
- Priority badge (High/Medium/Low)
- Sender information
- Relative timestamp ("2 hours ago")
- Hover effects for better UX
- Unread notifications have blue background

### Sidebar Features
- Filter tabs (All/Unread/Read)
- Mark all as read button
- Clear read notifications button
- Scrollable list with custom scrollbar
- Empty state messages

## 🔐 Authentication

The notification system automatically:
- Starts polling when user is authenticated (`isAuth: true`)
- Stops polling when user logs out
- Includes credentials (cookies) in all API requests

## 📊 State Management

### Redux Store Structure
```javascript
{
  notifications: {
    notifications: [],      // Array of notification objects
    unreadCount: 0,        // Number of unread notifications
    totalCount: 0,         // Total notifications count
    loading: false,        // Loading state
    error: null,           // Error message
    lastFetchTime: null    // Last fetch timestamp
  }
}
```

### Available Actions
- `setNotifications` - Set all notifications
- `setUnreadCount` - Update unread count
- `markNotificationAsRead` - Mark single as read
- `markAllAsRead` - Mark all as read
- `deleteNotification` - Delete single notification
- `deleteReadNotifications` - Delete all read
- `addNotification` - Add new notification (for future real-time)
- `clearNotifications` - Clear all notifications

## 🛠 API Integration

All API calls use axios with `withCredentials: true` for cookie-based authentication.

### Endpoints Used:
- `GET /notifications` - Fetch all notifications
- `GET /notifications/unread` - Fetch unread only
- `GET /notifications/count` - Get counts
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read/all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `DELETE /notifications/read/cleanup` - Delete all read

## 🎭 Priority System

### Priority Levels:
- **High**: Red badge (e.g., payments, order confirmations)
- **Medium**: Yellow badge (e.g., product approvals, subscriptions)
- **Low**: Blue badge (e.g., messages, general notifications)

## 🔔 Notification Types

The system recognizes these notification types:
- `order_placed` 🛒
- `order_confirmed` ✅
- `order_rejected` ❌
- `order_shipped` 📦
- `order_delivered` ✅
- `payment_received` 💰
- `payment_failed` ⚠️
- `product_approved` ✅
- `product_rejected` ❌
- `subscription_activated` ⭐
- `subscription_expired` ⏰
- `wishlist_price_drop` 💲
- `new_message` 💬
- `seller_approved` ✅
- `seller_rejected` ❌
- `general` 📢

## 🐛 Error Handling

- API errors are logged to console but don't interrupt user experience
- Failed mark-as-read still allows navigation
- Polling failures are silent (no alerts)
- Delete failures show alert to user

## 📱 Responsive Design

The notification system is fully responsive:
- Desktop: Full sidebar with all features
- Tablet: Optimized spacing
- Mobile: Full-screen overlay (existing responsive header)

## 🚦 Future Enhancements

Potential improvements:
1. **WebSocket Integration**: Replace polling with real-time updates
2. **Sound Notifications**: Audio alerts for new notifications
3. **Push Notifications**: Browser push notifications
4. **Notification Grouping**: Group similar notifications
5. **Advanced Filtering**: Filter by type, date, priority
6. **Search**: Search within notifications
7. **Notification Preferences**: User settings for notification types

## 🧪 Testing

### Manual Testing Steps:

1. **Login**: Ensure user is authenticated
2. **Check Polling**: Watch network tab for periodic `/notifications/count` calls
3. **Open Sidebar**: Click bell icon
4. **View Notifications**: Check if notifications are displayed
5. **Mark as Read**: Click notification, verify navigation and mark-as-read
6. **Filter**: Test All/Unread/Read filters
7. **Delete**: Test delete individual and clear read
8. **Mark All Read**: Test bulk mark-as-read

### Test Scenarios:
- ✅ New user (no notifications)
- ✅ User with unread notifications
- ✅ User with mixed read/unread
- ✅ Different notification types
- ✅ Different priority levels
- ✅ Long notification messages
- ✅ Network failures
- ✅ Logout/Login flow

## 🔍 Troubleshooting

### Notifications Not Appearing
- Check if backend is running
- Verify authentication (cookie/token)
- Check browser console for errors
- Verify backend URL in `.env`

### Polling Not Working
- Check Redux state (`isAuth` should be true)
- Verify no console errors
- Check network tab for API calls

### Navigation Not Working
- Verify routes exist in `AppRoutes.jsx`
- Check notification type mapping in `notificationUtils.js`
- Ensure `relatedEntityId` is present in notification

### Styles Not Applied
- Check CSS module imports
- Verify class names match
- Clear browser cache

## 📞 Support

For issues or questions:
1. Check console logs for errors
2. Verify all files are created/modified correctly
3. Ensure backend notification endpoints are working
4. Check Redux DevTools for state updates

## 🎓 Code Examples

### Using the Polling Hook in Other Components
```javascript
import useNotificationPolling from '../hooks/useNotificationPolling';

function MyComponent() {
  // Start polling with 60-second interval
  const { fetchNotificationCount } = useNotificationPolling(60000);
  
  // Manual refresh
  const handleRefresh = () => {
    fetchNotificationCount();
  };
}
```

### Manually Fetching Notifications
```javascript
import { notificationAPI } from '../services/notificationService';
import { setNotifications } from '../redux/notificationSlice';

const fetchNotifications = async () => {
  const response = await notificationAPI.getAllNotifications(50, 0);
  if (response.success) {
    dispatch(setNotifications({
      notifications: response.notifications,
      unreadCount: response.unreadCount,
    }));
  }
};
```

### Custom Navigation Logic
```javascript
import { getNotificationRoute } from '../utils/notificationUtils';

const handleCustomNavigation = (notification) => {
  const route = getNotificationRoute(notification);
  navigate(route);
};
```

## 📄 License

This notification system is part of the AdVantage project.

---

**Version**: 1.0.0  
**Last Updated**: December 2, 2025  
**Author**: AdVantage Development Team
