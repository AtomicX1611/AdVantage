import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  loading: false,
  error: null,
  lastFetchTime: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Set notifications from API
    setNotifications: (state, action) => {
      state.notifications = action.payload.notifications || [];
      state.unreadCount = action.payload.unreadCount || 0;
      state.totalCount = action.payload.notifications?.length || 0;
      state.lastFetchTime = Date.now();
      state.loading = false;
      state.error = null;
    },

    // Set unread count
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },

    // Mark single notification as read
    markNotificationAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all notifications as read
    markAllAsRead: (state) => {
      state.notifications = state.notifications.map(n => ({
        ...n,
        isRead: true,
        readAt: n.readAt || new Date().toISOString()
      }));
      state.unreadCount = 0;
    },

    // Delete notification
    deleteNotification: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n._id !== notificationId);
      state.totalCount = state.notifications.length;
    },

    // Delete all read notifications
    deleteReadNotifications: (state) => {
      state.notifications = state.notifications.filter(n => !n.isRead);
      state.totalCount = state.notifications.length;
    },

    // Add new notification (for real-time updates)
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
      state.totalCount += 1;
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.totalCount = 0;
      state.error = null;
    },
  },
});

export const {
  setNotifications,
  setUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  addNotification,
  setLoading,
  setError,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
