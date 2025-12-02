import axios from 'axios';
import API_CONFIG from '../config/api.config.js';

const API_BASE_URL = API_CONFIG.BACKEND_URL;

// Configure axios to include credentials (cookies)
const axiosConfig = {
  withCredentials: true,
};

export const notificationAPI = {
  /**
   * Get all notifications with pagination
   * @param {number} limit - Number of notifications to fetch (default: 50)
   * @param {number} skip - Number of notifications to skip (default: 0)
   * @returns {Promise} Response with notifications array and unreadCount
   */
  getAllNotifications: async (limit = 50, skip = 0) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notifications?limit=${limit}&skip=${skip}`,
        axiosConfig
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get only unread notifications
   * @returns {Promise} Response with unread notifications array
   */
  getUnreadNotifications: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notifications/unread`,
        axiosConfig
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },

  /**
   * Get notification counts (total, unread, read)
   * @returns {Promise} Response with count data
   */
  getNotificationCount: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notifications/count`,
        axiosConfig
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notification count:', error);
      throw error;
    }
  },

  /**
   * Get specific notification by ID
   * @param {string} notificationId - The notification ID
   * @returns {Promise} Response with notification data
   */
  getNotificationById: async (notificationId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notifications/${notificationId}`,
        axiosConfig
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notification by ID:', error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId - The notification ID
   * @returns {Promise} Response with updated notification
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        axiosConfig
      );
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise} Response with success message
   */
  markAllAsRead: async () => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/notifications/read/all`,
        {},
        axiosConfig
      );
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Delete a specific notification
   * @param {string} notificationId - The notification ID
   * @returns {Promise} Response with success message
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/notifications/${notificationId}`,
        axiosConfig
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * Delete all read notifications
   * @returns {Promise} Response with success message
   */
  deleteReadNotifications: async () => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/notifications/read/cleanup`,
        axiosConfig
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      throw error;
    }
  },

  /**
   * Delete all notifications
   * @returns {Promise} Response with success message
   */
  deleteAllNotifications: async () => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/notifications/all/clear`,
        axiosConfig
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  },

  /**
   * Create a new notification (admin/internal use)
   * @param {Object} notificationData - Notification data
   * @returns {Promise} Response with created notification
   */
  createNotification: async (notificationData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/notifications/create`,
        notificationData,
        axiosConfig
      );
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },
};

export default notificationAPI;
