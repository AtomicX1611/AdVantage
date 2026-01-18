import Notifications from "../models/Notifications.js";


export const createNotification = async (notificationData) => {
    return await Notifications.create(notificationData);
};

export const createManyNotifications = async (notificationsArray) => {
    return await Notifications.insertMany(notificationsArray);
};

export const getNotificationById = async (notificationId) => {
    return await Notifications.findById(notificationId)
        .populate('sender', 'username email profilePicPath')
        .populate('relatedEntity');
};

export const getNotificationsByRecipient = async (recipientId, recipientModel, options = {}) => {
    const { limit = 50, skip = 0, includeRead = true } = options;
    
    const query = { recipient: recipientId, recipientModel };
    if (!includeRead) {
        query.isRead = false;
    }
    
    const notifications = await Notifications.find(query)
        .populate('sender', 'username email profilePicPath')
        .populate('relatedEntity')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return notifications;
};

export const getUnreadNotifications = async (recipientId, recipientModel) => {
    return await Notifications.find({
        recipient: recipientId,
        recipientModel,
        isRead: false,
    })
        .populate('sender', 'username email profilePicPath')
        .populate('relatedEntity')
        .sort({ createdAt: -1 });
};

export const getNotificationsByCategory = async (recipientId, recipientModel, category, options = {}) => {
    const { limit = 50, skip = 0 } = options;

    return await Notifications.find({
        recipient: recipientId,
        recipientModel,
        category,
    })
        .populate('sender', 'username email profilePicPath')
        .populate('relatedEntity')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

export const countUnreadNotifications = async (recipientId, recipientModel) => {
    return await Notifications.countDocuments({
        recipient: recipientId,
        recipientModel,
        isRead: false,
    });
};

export const markAsRead = async (notificationId) => {
    return await Notifications.findByIdAndUpdate(
        notificationId,
        {
            $set: {
                isRead: true,
                readAt: new Date(),
            },
        },
        { new: true }
    );
};

export const markManyAsRead = async (notificationIds) => {
    return await Notifications.updateMany(
        { _id: { $in: notificationIds } },
        {
            $set: {
                isRead: true,
                readAt: new Date(),
            },
        }
    );
};

export const markAllAsRead = async (recipientId, recipientModel) => {
    return await Notifications.updateMany(
        {
            recipient: recipientId,
            recipientModel,
            isRead: false,
        },
        {
            $set: {
                isRead: true,
                readAt: new Date(),
            },
        }
    );
};

export const deleteNotification = async (notificationId) => {
    return await Notifications.findByIdAndDelete(notificationId);
};

export const deleteAllNotifications = async (recipientId, recipientModel) => {
    return await Notifications.deleteMany({
        recipient: recipientId,
        recipientModel,
    });
};

export const deleteOldReadNotifications = async (daysOld = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await Notifications.deleteMany({
        isRead: true,
        readAt: { $lt: cutoffDate },
    });
};
