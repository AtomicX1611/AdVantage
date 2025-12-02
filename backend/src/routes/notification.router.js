import express from "express";
import {
    checkToken,
    serializeUser,
    authorize
} from "../middlewares/protect.js";
import {
    createNotification,
    getNotifications,
    getUnreadNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
    deleteAllNotifications,
    getNotificationsCount
} from "../controllers/notification.controller.js";

export const router = express.Router();

// All routes require authentication
router.use(checkToken);
router.use(serializeUser);

// Get all notifications for the authenticated user
router.get("/", getNotifications);

// Get unread notifications
router.get("/unread", getUnreadNotifications);

// Get notifications count
router.get("/count", getNotificationsCount);

// Get a specific notification by ID
router.get("/:notificationId", getNotificationById);

// Mark a notification as read
router.patch("/:notificationId/read", markAsRead);

// Mark all notifications as read
router.patch("/read/all", markAllAsRead);

// Delete a specific notification
router.delete("/:notificationId", deleteNotification);

// Delete all read notifications (cleanup)
router.delete("/read/cleanup", deleteReadNotifications);

// Delete all notifications
router.delete("/all/clear", deleteAllNotifications);

// Create a notification (typically for internal use or admin/system)
router.post("/create", createNotification);

export default router;
