import {
    createNotification,
    createManyNotifications,

} from '../daos/notifications.dao.js';
/**
 * Create a product request notification (for seller when buyer requests their product)
 */
export const createNewRequestNotification = async (sellerId, buyerId, productId, productName, biddingPrice) => {
    return await createNotification({
        recipient: sellerId,
        recipientModel: 'Users',
        sender: buyerId,
        senderModel: 'Users',
        category: 'new_request',
        title: 'New Product Request',
        message: `Someone has requested your product "${productName}" with a bid of ₹${biddingPrice}`,
        relatedEntity: productId,
        relatedEntityModel: 'Products',
        metadata: { productName, biddingPrice },
    });
};

/**
 * Create a request accepted notification (for buyer when seller accepts)
 */
export const createRequestAcceptedNotification = async (buyerId, sellerId, productId, productName) => {
    return await createNotification({
        recipient: buyerId,
        recipientModel: 'Users',
        sender: sellerId,
        senderModel: 'Users',
        category: 'request_accepted',
        title: 'Request Accepted!',
        message: `Your request for "${productName}" has been accepted. Complete the payment to finalize the purchase.`,
        relatedEntity: productId,
        relatedEntityModel: 'Products',
        metadata: { productName },
    });
};

/**
 * Create a request rejected notification (for buyer when seller rejects)
 */
export const createRequestRejectedNotification = async (buyerId, sellerId, productId, productName) => {
    return await createNotification({
        recipient: buyerId,
        recipientModel: 'Users',
        sender: sellerId,
        senderModel: 'Users',
        category: 'request_rejected',
        title: 'Request Rejected',
        message: `Your request for "${productName}" has been rejected by the seller.`,
        relatedEntity: productId,
        relatedEntityModel: 'Products',
        metadata: { productName },
    });
};

/**
 * Create a request revoked notification (for buyer when seller revokes acceptance)
 */
export const createRequestRevokedNotification = async (buyerId, sellerId, productId, productName) => {
    return await createNotification({
        recipient: buyerId,
        recipientModel: 'Users',
        sender: sellerId,
        senderModel: 'Users',
        category: 'request_revoked',
        title: 'Acceptance Revoked',
        message: `The seller has revoked their acceptance for "${productName}".`,
        relatedEntity: productId,
        relatedEntityModel: 'Products',
        metadata: { productName },
    });
};

/**
 * Create a product sold notification (for seller when product is sold)
 */
export const createProductSoldNotification = async (sellerId, buyerId, productId, productName, price) => {
    return await createNotification({
        recipient: sellerId,
        recipientModel: 'Users',
        sender: buyerId,
        senderModel: 'Users',
        category: 'product_sold',
        title: 'Product Sold!',
        message: `Congratulations! Your product "${productName}" has been sold for ₹${price}.`,
        relatedEntity: productId,
        relatedEntityModel: 'Products',
        metadata: { productName, price },
    });
};

/**
 * Create a product purchased notification (for buyer after successful purchase)
 */
export const createProductPurchasedNotification = async (buyerId, sellerId, productId, productName, price) => {
    return await createNotification({
        recipient: buyerId,
        recipientModel: 'Users',
        sender: sellerId,
        senderModel: 'Users',
        category: 'product_purchased',
        title: 'Purchase Successful!',
        message: `You have successfully purchased "${productName}" for ₹${price}.`,
        relatedEntity: productId,
        relatedEntityModel: 'Products',
        metadata: { productName, price },
    });
};

/**
 * Create a product verified notification (for seller when product is verified)
 */
export const createProductVerifiedNotification = async (sellerId, managerId, productId, productName) => {
    return await createNotification({
        recipient: sellerId,
        recipientModel: 'Users',
        sender: managerId,
        senderModel: 'Managers',
        category: 'product_verified',
        title: 'Product Verified',
        message: `Your product "${productName}" has been verified`,
        relatedEntity: productId,
        relatedEntityModel: 'Products',
        metadata: { productName },
    });
};

/**
 * Create a payment received notification (for seller)
 */
export const createPaymentReceivedNotification = async (sellerId, buyerId, paymentId, amount, productName) => {
    return await createNotification({
        recipient: sellerId,
        recipientModel: 'Users',
        sender: buyerId,
        senderModel: 'Users',
        category: 'payment_received',
        title: 'Payment Received',
        message: `You received a payment of ₹${amount} for "${productName}".`,
        relatedEntity: paymentId,
        relatedEntityModel: 'Payment',
        metadata: { amount, productName },
    });
};

/**
 * Create a payment made notification (for buyer)
 */
export const createPaymentMadeNotification = async (buyerId, paymentId, amount, productName) => {
    return await createNotification({
        recipient: buyerId,
        recipientModel: 'Users',
        sender: null,
        senderModel: null,
        category: 'payment_made',
        title: 'Payment Successful',
        message: `Your payment of ₹${amount} for "${productName}" was successful.`,
        relatedEntity: paymentId,
        relatedEntityModel: 'Payment',
        metadata: { amount, productName },
    });
};

/**
 * Create a subscription updated notification
 */
export const createSubscriptionUpdatedNotification = async (userId, newSubscriptionLevel) => {
    return await createNotification({
        recipient: userId,
        recipientModel: 'Users',
        sender: null,
        senderModel: null,
        category: 'subscription_updated',
        title: 'Subscription Updated',
        message: `Your subscription has been updated to level ${newSubscriptionLevel}.`,
        relatedEntity: null,
        relatedEntityModel: null,
        metadata: { subscriptionLevel: newSubscriptionLevel },
    });
};

/**
 * Create a new message notification
 */
export const createNewMessageNotification = async (recipientId, senderId, messagePreview) => {
    return await createNotification({
        recipient: recipientId,
        recipientModel: 'Users',
        sender: senderId,
        senderModel: 'Users',
        category: 'new_message',
        title: 'New Message',
        message: messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview,
        relatedEntity: null,
        relatedEntityModel: null,
        metadata: { fullMessage: messagePreview },
    });
};

/**
 * Create a welcome notification for new users
 */
export const createWelcomeNotification = async (userId) => {
    return await createNotification({
        recipient: userId,
        recipientModel: 'Users',
        sender: null,
        senderModel: null,
        category: 'welcome',
        title: 'Welcome to AdVantage!',
        message: 'Thank you for joining AdVantage. Start exploring products or list your own items for sale!',
        relatedEntity: null,
        relatedEntityModel: null,
        metadata: {},
    });
};

/**
 * Create a system announcement notification
 */
export const createAnnouncementNotification = async (recipientId, recipientModel, title, message) => {
    return await createNotification({
        recipient: recipientId,
        recipientModel,
        sender: null,
        senderModel: null,
        category: 'announcement',
        title,
        message,
        relatedEntity: null,
        relatedEntityModel: null,
        metadata: {},
    });
};

/**
 * Create a verification pending notification (for managers)
 */
export const createVerificationPendingNotification = async (managerId, productId, productName, sellerName) => {
    return await createNotification({
        recipient: managerId,
        recipientModel: 'Managers',
        sender: null,
        senderModel: null,
        category: 'verification_pending',
        title: 'New Product Awaiting Verification',
        message: `A new product "${productName}" by ${sellerName} is waiting for verification.`,
        relatedEntity: productId,
        relatedEntityModel: 'Products',
        metadata: { productName, sellerName },
    });
};

export const createBulkAnnouncementNotifications = async (userIds, title, message) => {
    const notifications = userIds.map(userId => ({
        recipient: userId,
        recipientModel: 'Users',
        sender: null,
        senderModel: null,
        category: 'announcement',
        title,
        message,
        relatedEntity: null,
        relatedEntityModel: null,
        metadata: {},
    }));

    return await createManyNotifications(notifications);
};