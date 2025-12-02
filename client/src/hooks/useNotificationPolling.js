import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationAPI } from '../services/notificationService';
import { setUnreadCount, setNotifications } from '../redux/notificationSlice';

/**
 * Custom hook for polling notifications
 * @param {number} interval - Polling interval in milliseconds (default: 30000ms = 30s)
 * @param {boolean} enabled - Whether polling is enabled (default: true when user is authenticated)
 */
export const useNotificationPolling = (interval = 30000, enabled = true) => {
  const dispatch = useDispatch();
  const { isAuth } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuth || !enabled) {
      return;
    }

    // Fetch immediately on mount
    fetchNotificationCount();

    // Set up polling interval
    const pollInterval = setInterval(() => {
      fetchNotificationCount();
    }, interval);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, [isAuth, enabled, interval]);

  const fetchNotificationCount = async () => {
    try {
      const response = await notificationAPI.getNotificationCount();
      if (response.success) {
        dispatch(setUnreadCount(response.unreadCount));
      }
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
      // Silently fail - don't show errors for background polling
    }
  };

  const fetchAllNotifications = async (limit = 50, skip = 0) => {
    try {
      const response = await notificationAPI.getAllNotifications(limit, skip);
      if (response.success) {
        dispatch(setNotifications({
          notifications: response.notifications,
          unreadCount: response.unreadCount,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  };

  return {
    fetchNotificationCount,
    fetchAllNotifications,
  };
};

export default useNotificationPolling;
