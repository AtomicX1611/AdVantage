import {
    createNotificationService,
    getNotificationsService,
    getUnreadNotificationsService,
    markNotificationAsReadService,
    markAllNotificationsAsReadService,
    deleteNotificationService,
    deleteReadNotificationsService,
    deleteAllNotificationsService,
    getNotificationByIdService,
    getNotificationsCountService
} from "../services/notification.service.js";

// Helper function to determine user model based on role
const getUserModel = (role) => {
    const modelMap = {
        'user': 'Users',
        'seller': 'Sellers',
        'admin': 'Admins',
        'manager': 'Managers'
    };
    return modelMap[role] || 'Users';
};

// Create a new notification (typically called internally by other controllers)
export const createNotification = async (req, res) => {
    try {
        const { toId, toModel, type, title, description, relatedEntityId, relatedEntityType, priority } = req.body;
        const fromId = req.user._id;
        const fromModel = getUserModel(req.user.role);

        if (!toId || !toModel || !type || !title || !description) {
            return res.status(400).json({
                success: false,
                message: "toId, toModel, type, title, and description are required"
            });
        }

        const response = await createNotificationService(
            fromId,
            fromModel,
            toId,
            toModel,
            type,
            title,
            description,
            relatedEntityId,
            relatedEntityType,
            priority
        );

        return res.status(response.status).json({
            success: response.success,
            message: response.message,
            notification: response.notification
        });
    } catch (error) {
        console.error("Error in createNotification controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get all notifications for the authenticated user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const userModel = getUserModel(req.user.role);
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;

        const response = await getNotificationsService(userId, userModel, limit, skip);

        return res.status(response.status).json({
            success: response.success,
            message: response.message,
            notifications: response.notifications,
            unreadCount: response.unreadCount
        });
    } catch (error) {
        console.error("Error in getNotifications controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get unread notifications for the authenticated user
export const getUnreadNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const userModel = getUserModel(req.user.role);

        const response = await getUnreadNotificationsService(userId, userModel);

        return res.status(response.status).json({
            success: response.success,
            message: response.message,
            notifications: response.notifications,
            count: response.count
        });
    } catch (error) {
        console.error("Error in getUnreadNotifications controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get a specific notification by ID
export const getNotificationById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { notificationId } = req.params;

        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: "Notification ID is required"
            });
        }

        const response = await getNotificationByIdService(notificationId, userId);

        return res.status(response.status).json({
            success: response.success,
            message: response.message,
            notification: response.notification
        });
    } catch (error) {
        console.error("Error in getNotificationById controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const { notificationId } = req.params;

        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: "Notification ID is required"
            });
        }

        const response = await markNotificationAsReadService(notificationId, userId);

        return res.status(response.status).json({
            success: response.success,
            message: response.message,
            notification: response.notification
        });
    } catch (error) {
        console.error("Error in markAsRead controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const userModel = getUserModel(req.user.role);

        const response = await markAllNotificationsAsReadService(userId, userModel);

        return res.status(response.status).json({
            success: response.success,
            message: response.message,
            modifiedCount: response.modifiedCount
        });
    } catch (error) {
        console.error("Error in markAllAsRead controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Delete a specific notification
export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user._id;
        const { notificationId } = req.params;

        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: "Notification ID is required"
            });
        }

        const response = await deleteNotificationService(notificationId, userId);

        return res.status(response.status).json({
            success: response.success,
            message: response.message
        });
    } catch (error) {
        console.error("Error in deleteNotification controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Delete all read notifications (cleanup)
export const deleteReadNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const userModel = getUserModel(req.user.role);

        const response = await deleteReadNotificationsService(userId, userModel);

        return res.status(response.status).json({
            success: response.success,
            message: response.message,
            deletedCount: response.deletedCount
        });
    } catch (error) {
        console.error("Error in deleteReadNotifications controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Delete all notifications
export const deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const userModel = getUserModel(req.user.role);

        const response = await deleteAllNotificationsService(userId, userModel);

        return res.status(response.status).json({
            success: response.success,
            message: response.message,
            deletedCount: response.deletedCount
        });
    } catch (error) {
        console.error("Error in deleteAllNotifications controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get notifications count
export const getNotificationsCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const userModel = getUserModel(req.user.role);

        const response = await getNotificationsCountService(userId, userModel);

        return res.status(response.status).json({
            success: response.success,
            message: response.message,
            totalCount: response.totalCount,
            unreadCount: response.unreadCount,
            readCount: response.readCount
        });
    } catch (error) {
        console.error("Error in getNotificationsCount controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};
