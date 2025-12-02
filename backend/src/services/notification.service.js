import {
    createNotificationDao,
    getNotificationsByUserDao,
    getUnreadNotificationsDao,
    markNotificationAsReadDao,
    markAllNotificationsAsReadDao,
    deleteNotificationDao,
    deleteReadNotificationsDao,
    deleteAllNotificationsDao,
    getNotificationByIdDao,
    getNotificationsCountDao
} from "../daos/notifications.dao.js";

// Create a new notification
export const createNotificationService = async (fromId, fromModel, toId, toModel, type, title, description, relatedEntityId = null, relatedEntityType = null, priority = 'medium') => {
    const notificationData = {
        from: fromId,
        fromModel,
        to: toId,
        toModel,
        type,
        title,
        description,
        relatedEntityId,
        relatedEntityType,
        priority
    };

    const result = await createNotificationDao(notificationData);
    
    if (!result.success) {
        return {
            success: false,
            status: 500,
            message: result.message || "Failed to create notification"
        };
    }

    return {
        success: true,
        status: 201,
        notification: result.notification,
        message: "Notification created successfully"
    };
};

// Get all notifications for a user
export const getNotificationsService = async (userId, userModel, limit = 50, skip = 0) => {
    const result = await getNotificationsByUserDao(userId, userModel, limit, skip);

    if (!result.success) {
        return {
            success: false,
            status: 500,
            message: result.message || "Failed to fetch notifications"
        };
    }

    return {
        success: true,
        status: 200,
        notifications: result.notifications,
        unreadCount: result.unreadCount,
        message: "Notifications fetched successfully"
    };
};

// Get unread notifications
export const getUnreadNotificationsService = async (userId, userModel) => {
    const result = await getUnreadNotificationsDao(userId, userModel);

    if (!result.success) {
        return {
            success: false,
            status: 500,
            message: result.message || "Failed to fetch unread notifications"
        };
    }

    return {
        success: true,
        status: 200,
        notifications: result.notifications,
        count: result.count,
        message: "Unread notifications fetched successfully"
    };
};

// Mark notification as read
export const markNotificationAsReadService = async (notificationId, userId) => {
    const result = await markNotificationAsReadDao(notificationId, userId);

    if (!result.success) {
        return {
            success: false,
            status: 404,
            message: result.message || "Failed to mark notification as read"
        };
    }

    return {
        success: true,
        status: 200,
        notification: result.notification,
        message: "Notification marked as read"
    };
};

// Mark all notifications as read
export const markAllNotificationsAsReadService = async (userId, userModel) => {
    const result = await markAllNotificationsAsReadDao(userId, userModel);

    if (!result.success) {
        return {
            success: false,
            status: 500,
            message: result.message || "Failed to mark all notifications as read"
        };
    }

    return {
        success: true,
        status: 200,
        modifiedCount: result.modifiedCount,
        message: "All notifications marked as read"
    };
};

// Delete a specific notification
export const deleteNotificationService = async (notificationId, userId) => {
    const result = await deleteNotificationDao(notificationId, userId);

    if (!result.success) {
        return {
            success: false,
            status: 404,
            message: result.message || "Failed to delete notification"
        };
    }

    return {
        success: true,
        status: 200,
        message: result.message
    };
};

// Delete all read notifications
export const deleteReadNotificationsService = async (userId, userModel) => {
    const result = await deleteReadNotificationsDao(userId, userModel);

    if (!result.success) {
        return {
            success: false,
            status: 500,
            message: result.message || "Failed to delete read notifications"
        };
    }

    return {
        success: true,
        status: 200,
        deletedCount: result.deletedCount,
        message: result.message
    };
};

// Delete all notifications
export const deleteAllNotificationsService = async (userId, userModel) => {
    const result = await deleteAllNotificationsDao(userId, userModel);

    if (!result.success) {
        return {
            success: false,
            status: 500,
            message: result.message || "Failed to delete all notifications"
        };
    }

    return {
        success: true,
        status: 200,
        deletedCount: result.deletedCount,
        message: result.message
    };
};

// Get notification by ID
export const getNotificationByIdService = async (notificationId, userId) => {
    const result = await getNotificationByIdDao(notificationId, userId);

    if (!result.success) {
        return {
            success: false,
            status: 404,
            message: result.message || "Notification not found"
        };
    }

    return {
        success: true,
        status: 200,
        notification: result.notification,
        message: "Notification fetched successfully"
    };
};

// Get notifications count
export const getNotificationsCountService = async (userId, userModel) => {
    const result = await getNotificationsCountDao(userId, userModel);

    if (!result.success) {
        return {
            success: false,
            status: 500,
            message: result.message || "Failed to get notifications count"
        };
    }

    return {
        success: true,
        status: 200,
        totalCount: result.totalCount,
        unreadCount: result.unreadCount,
        readCount: result.readCount,
        message: "Notifications count fetched successfully"
    };
};
