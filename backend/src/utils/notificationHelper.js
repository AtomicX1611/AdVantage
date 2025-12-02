import { createNotificationDao } from "../daos/notifications.dao.js";

/**
 * Helper function to create notifications easily from anywhere in the application
 */
export const createNotification = async ({
    fromId,
    fromModel,
    toId,
    toModel,
    type,
    title,
    description,
    relatedEntityId = null,
    relatedEntityType = null,
    priority = 'medium'
}) => {
    try {
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
        return result;
    } catch (error) {
        console.error("Error creating notification:", error);
        return { success: false, message: error.message };
    }
};

/**
 * Helper to determine user model from role
 */
export const getUserModel = (role) => {
    const modelMap = {
        'user': 'Users',
        'admin': 'Admins',
        'manager': 'Managers'
    };
    return modelMap[role] || 'Users';
};

/**
 * Predefined notification templates
 */
export const notificationTemplates = {
    ORDER_PLACED: (buyerName, productName) => ({
        type: 'order_placed',
        title: 'New Order Placed',
        description: `${buyerName} has placed an order for ${productName}`,
        priority: 'high'
    }),
    
    ORDER_CONFIRMED: (productName) => ({
        type: 'order_confirmed',
        title: 'Order Confirmed',
        description: `Your order for ${productName} has been confirmed`,
        priority: 'high'
    }),
    
    REQUEST_ACCEPTED: (productName) => ({
        type: 'order_confirmed',
        title: 'Request Accepted',
        description: `Your request for ${productName} has been accepted`,
        priority: 'high'
    }),
    
    REQUEST_REJECTED: (productName) => ({
        type: 'order_rejected',
        title: 'Request Rejected',
        description: `Your request for ${productName} has been rejected`,
        priority: 'medium'
    }),
    
    PAYMENT_RECEIVED: (amount, buyerName) => ({
        type: 'payment_received',
        title: 'Payment Received',
        description: `Payment of ₹${amount} received from ${buyerName}`,
        priority: 'high'
    }),
    
    PAYMENT_FAILED: (amount) => ({
        type: 'payment_failed',
        title: 'Payment Failed',
        description: `Payment of ₹${amount} has failed. Please try again.`,
        priority: 'high'
    }),
    
    SUBSCRIPTION_ACTIVATED: (planName) => ({
        type: 'subscription_activated',
        title: 'Subscription Activated',
        description: `Your ${planName} subscription has been activated successfully`,
        priority: 'medium'
    }),
    
    PRODUCT_APPROVED: (productName) => ({
        type: 'product_approved',
        title: 'Product Approved',
        description: `Your product ${productName} has been approved and is now live`,
        priority: 'medium'
    }),
    
    PRODUCT_REJECTED: (productName, reason) => ({
        type: 'product_rejected',
        title: 'Product Rejected',
        description: `Your product ${productName} was rejected. Reason: ${reason}`,
        priority: 'high'
    }),
    
    NEW_MESSAGE: (senderName) => ({
        type: 'new_message',
        title: 'New Message',
        description: `You have a new message from ${senderName}`,
        priority: 'low'
    }),
    
    PRODUCT_AVAILABLE: (productName) => ({
        type: 'general',
        title: 'Product Available',
        description: `${productName} is now available for rent`,
        priority: 'medium'
    }),
    
    PRODUCT_RENTED: (productName, buyerName) => ({
        type: 'general',
        title: 'Product Rented',
        description: `Your product ${productName} has been rented by ${buyerName}`,
        priority: 'high'
    })
};
