/**
 * Notification utility functions
 * Includes navigation logic, time formatting, and helper functions
 */

/**
 * Get the appropriate route for a notification based on its type
 * @param {Object} notification - The notification object
 * @returns {string} The route to navigate to
 */


// So we just need to adjust the routes based on type of message
export const getNotificationRoute = (notification) => {
  const { type, relatedEntityId, relatedEntityType, from } = notification;

  switch (type) {
    // BUYER RECEIVES - Order/Request related
    case 'order_confirmed':
    case 'request_accepted':
      return `/pending-transactions`; // Navigate to product requests page
    
    case 'order_rejected':
    case 'request_rejected':
      return relatedEntityId ? `/product/${relatedEntityId}` : '/';
    
    case 'order_shipped':
    case 'order_delivered':
      return `/yourProducts`;

    // BUYER RECEIVES - Subscription related
    case 'subscription_activated':
      return `/profile`;
    
    case 'subscription_expired':
      return `/seller/subscription`;
    
    // BUYER RECEIVES - Wishlist
    case 'wishlist_price_drop':
      return relatedEntityId ? `/product/${relatedEntityId}` : '/wishlist';

    // SELLER RECEIVES - Order/Request related
    case 'order_placed':
      return `/seller/dashboard/requests`; // Navigate to seller's request management
    
    case 'payment_received':
      return `/pending-transactions`;
    
    // SELLER RECEIVES - Product related
    case 'product_approved':
      return relatedEntityId ? `/product/${relatedEntityId}` : '/seller/dashboard';
    
    case 'product_rejected':
      return `/seller/dashboard/for-sale`;

    // BOTH - Messages
    case 'new_message':
      return from?._id ? `/chat?userId=${from._id}` : '/chat';
    
    // BOTH - Payment
    case 'payment_failed':
      return `/pending-transactions`;

    // GENERAL
    case 'general':
      if (relatedEntityType === 'Product' && relatedEntityId) {
        return `/product/${relatedEntityId}`;
      }
      if (relatedEntityType === 'Payment') {
        return `/pending-transactions`;
      }
      return '/'; // Default to home

    default:
      return '/'; // Default to home
  }
};

/**
 * Get icon for notification type
 * @param {string} type - Notification type
 * @returns {string} Icon/emoji for the notification
 */
export const getNotificationIcon = (type) => {
  const iconMap = {
    order_placed: '🛒',
    order_confirmed: '✅',
    order_rejected: '❌',
    order_shipped: '📦',
    order_delivered: '✅',
    payment_received: '💰',
    payment_failed: '⚠️',
    product_approved: '✅',
    product_rejected: '❌',
    subscription_activated: '⭐',
    subscription_expired: '⏰',
    wishlist_price_drop: '💲',
    new_message: '💬',
    seller_approved: '✅',
    seller_rejected: '❌',
    general: '📢',
  };

  return iconMap[type] || '🔔';
};

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted relative time
 */
export const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - notificationTime) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
};

/**
 * Format timestamp to readable date/time
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted date/time
 */
export const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get priority class name for styling
 * @param {string} priority - Notification priority (low/medium/high)
 * @returns {string} CSS class name
 */
export const getPriorityClass = (priority) => {
  const classMap = {
    high: 'priorityHigh',
    medium: 'priorityMedium',
    low: 'priorityLow',
  };

  return classMap[priority] || 'priorityMedium';
};

/**
 * Group notifications by date
 * @param {Array} notifications - Array of notifications
 * @returns {Object} Notifications grouped by date
 */
export const groupNotificationsByDate = (notifications) => {
  const grouped = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  notifications.forEach((notification) => {
    const notificationDate = new Date(notification.createdAt);
    const notificationDay = new Date(
      notificationDate.getFullYear(),
      notificationDate.getMonth(),
      notificationDate.getDate()
    );

    if (notificationDay.getTime() === today.getTime()) {
      grouped.today.push(notification);
    } else if (notificationDay.getTime() === yesterday.getTime()) {
      grouped.yesterday.push(notification);
    } else if (notificationDate >= lastWeek) {
      grouped.thisWeek.push(notification);
    } else {
      grouped.older.push(notification);
    }
  });

  return grouped;
};

/**
 * Filter notifications by type
 * @param {Array} notifications - Array of notifications
 * @param {string} filterType - Type to filter by (all, unread, read, or specific notification type)
 * @returns {Array} Filtered notifications
 */
export const filterNotifications = (notifications, filterType) => {
  if (filterType === 'all') {
    return notifications;
  }

  if (filterType === 'unread') {
    return notifications.filter(n => !n.isRead);
  }

  if (filterType === 'read') {
    return notifications.filter(n => n.isRead);
  }

  // Filter by specific notification type
  return notifications.filter(n => n.type === filterType);
};

/**
 * Get notification category for filtering
 * @param {string} type - Notification type
 * @returns {string} Category name
 */
export const getNotificationCategory = (type) => {
  const categoryMap = {
    order_placed: 'orders',
    order_confirmed: 'orders',
    order_rejected: 'orders',
    order_shipped: 'orders',
    order_delivered: 'orders',
    payment_received: 'payments',
    payment_failed: 'payments',
    product_approved: 'products',
    product_rejected: 'products',
    subscription_activated: 'account',
    subscription_expired: 'account',
    wishlist_price_drop: 'wishlist',
    new_message: 'messages',
    seller_approved: 'account',
    seller_rejected: 'account',
    general: 'general',
  };

  return categoryMap[type] || 'general';
};

export default {
  getNotificationRoute,
  getNotificationIcon,
  formatRelativeTime,
  formatDateTime,
  getPriorityClass,
  groupNotificationsByDate,
  filterNotifications,
  getNotificationCategory,
};
