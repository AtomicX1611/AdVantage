import Notifications from "../models/Notifications.js";

// Create a new notification
export const createNotificationDao = async (notificationData) => {
    try {
        const notification = await Notifications.create(notificationData);
        return {
            success: true,
            notification
        };
    } catch (error) {
        console.error("Error creating notification:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

// Get all notifications for a user
export const getNotificationsByUserDao = async (userId, userModel, limit = 50, skip = 0) => {
    try {
        const notifications = await Notifications.find({ 
            to: userId, 
            toModel: userModel 
        })
        .populate('from', 'username email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

        const unreadCount = await Notifications.countDocuments({ 
            to: userId, 
            toModel: userModel,
            isRead: false 
        });

        return {
            success: true,
            notifications,
            unreadCount
        };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

// Get unread notifications for a user
export const getUnreadNotificationsDao = async (userId, userModel) => {
    try {
        const notifications = await Notifications.find({ 
            to: userId, 
            toModel: userModel,
            isRead: false 
        })
        .populate('from', 'username email')
        .sort({ createdAt: -1 });

        return {
            success: true,
            notifications,
            count: notifications.length
        };
    } catch (error) {
        console.error("Error fetching unread notifications:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

// Mark a notification as read
export const markNotificationAsReadDao = async (notificationId, userId) => {
    try {
        const notification = await Notifications.findOneAndUpdate(
            { _id: notificationId, to: userId },
            { 
                isRead: true,
                readAt: new Date()
            },
            { new: true }
        );

        if (!notification) {
            return {
                success: false,
                message: "Notification not found or unauthorized"
            };
        }

        return {
            success: true,
            notification
        };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsReadDao = async (userId, userModel) => {
    try {
        const result = await Notifications.updateMany(
            { 
                to: userId, 
                toModel: userModel,
                isRead: false 
            },
            { 
                isRead: true,
                readAt: new Date()
            }
        );

        return {
            success: true,
            modifiedCount: result.modifiedCount
        };
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

// Delete a specific notification
export const deleteNotificationDao = async (notificationId, userId) => {
    try {
        const notification = await Notifications.findOneAndDelete({
            _id: notificationId,
            to: userId
        });

        if (!notification) {
            return {
                success: false,
                message: "Notification not found or unauthorized"
            };
        }

        return {
            success: true,
            message: "Notification deleted successfully"
        };
    } catch (error) {
        console.error("Error deleting notification:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

// Delete all read notifications for a user
export const deleteReadNotificationsDao = async (userId, userModel) => {
    try {
        const result = await Notifications.deleteMany({
            to: userId,
            toModel: userModel,
            isRead: true
        });

        return {
            success: true,
            deletedCount: result.deletedCount,
            message: "Read notifications cleaned up successfully"
        };
    } catch (error) {
        console.error("Error deleting read notifications:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

// Delete all notifications for a user
export const deleteAllNotificationsDao = async (userId, userModel) => {
    try {
        const result = await Notifications.deleteMany({
            to: userId,
            toModel: userModel
        });

        return {
            success: true,
            deletedCount: result.deletedCount,
            message: "All notifications deleted successfully"
        };
    } catch (error) {
        console.error("Error deleting all notifications:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

// Get notification by ID
export const getNotificationByIdDao = async (notificationId, userId) => {
    try {
        const notification = await Notifications.findOne({
            _id: notificationId,
            to: userId
        }).populate('from', 'username email');

        if (!notification) {
            return {
                success: false,
                message: "Notification not found"
            };
        }

        return {
            success: true,
            notification
        };
    } catch (error) {
        console.error("Error fetching notification:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

// Get notifications count
export const getNotificationsCountDao = async (userId, userModel) => {
    try {
        const totalCount = await Notifications.countDocuments({ 
            to: userId, 
            toModel: userModel 
        });
        
        const unreadCount = await Notifications.countDocuments({ 
            to: userId, 
            toModel: userModel,
            isRead: false 
        });

        return {
            success: true,
            totalCount,
            unreadCount,
            readCount: totalCount - unreadCount
        };
    } catch (error) {
        console.error("Error getting notifications count:", error);
        return {
            success: false,
            message: error.message
        };
    }
};
