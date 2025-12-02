// Example usage of notification system in various scenarios

import { createNotification, notificationTemplates, getUserModel } from "../utils/notificationHelper.js";

/**
 * SCENARIO 1: Product Request Notification
 * When: Buyer requests a product
 * Who gets notified: Seller
 */
async function notifySellerOfProductRequest(buyerId, sellerId, productId, buyerName, productName) {
    const notifData = notificationTemplates.ORDER_PLACED(buyerName, productName);
    await createNotification({
        fromId: buyerId,
        fromModel: 'Users',
        toId: sellerId,
        toModel: 'Users',
        type: notifData.type,
        title: notifData.title,
        description: notifData.description,
        relatedEntityId: productId,
        relatedEntityType: 'Product',
        priority: notifData.priority
    });
}

/**
 * SCENARIO 2: Request Accepted
 * When: Seller accepts buyer's request
 * Who gets notified: Buyer
 */
async function notifyBuyerRequestAccepted(sellerId, buyerId, productId, productName) {
    const notifData = notificationTemplates.REQUEST_ACCEPTED(productName);
    await createNotification({
        fromId: sellerId,
        fromModel: 'Users',
        toId: buyerId,
        toModel: 'Users',
        type: notifData.type,
        title: notifData.title,
        description: notifData.description,
        relatedEntityId: productId,
        relatedEntityType: 'Product',
        priority: notifData.priority
    });
}

/**
 * SCENARIO 3: Request Rejected
 * When: Seller rejects buyer's request
 * Who gets notified: Buyer
 */
async function notifyBuyerRequestRejected(sellerId, buyerId, productId, productName) {
    const notifData = notificationTemplates.REQUEST_REJECTED(productName);
    await createNotification({
        fromId: sellerId,
        fromModel: 'Users',
        toId: buyerId,
        toModel: 'Users',
        type: notifData.type,
        title: notifData.title,
        description: notifData.description,
        relatedEntityId: productId,
        relatedEntityType: 'Product',
        priority: notifData.priority
    });
}

/**
 * SCENARIO 4: Payment Received
 * When: Buyer completes payment
 * Who gets notified: Seller
 */
async function notifySellerPaymentReceived(buyerId, sellerId, productId, amount, buyerName) {
    const notifData = notificationTemplates.PAYMENT_RECEIVED(amount, buyerName);
    await createNotification({
        fromId: buyerId,
        fromModel: 'Users',
        toId: sellerId,
        toModel: 'Users',
        type: notifData.type,
        title: notifData.title,
        description: notifData.description,
        relatedEntityId: productId,
        relatedEntityType: 'Payment',
        priority: notifData.priority
    });
}

/**
 * SCENARIO 5: Subscription Activated
 * When: User purchases/activates subscription
 * Who gets notified: The user themselves
 */
async function notifySubscriptionActivation(userId, planName) {
    const notifData = notificationTemplates.SUBSCRIPTION_ACTIVATED(planName);
    await createNotification({
        fromId: userId,
        fromModel: 'Users',
        toId: userId,
        toModel: 'Users',
        type: notifData.type,
        title: notifData.title,
        description: notifData.description,
        relatedEntityId: null,
        relatedEntityType: null,
        priority: notifData.priority
    });
}

/**
 * SCENARIO 6: New Message
 * When: User sends a message
 * Who gets notified: Message recipient
 */
async function notifyNewMessage(senderId, recipientId, senderName) {
    const notifData = notificationTemplates.NEW_MESSAGE(senderName);
    await createNotification({
        fromId: senderId,
        fromModel: 'Users',
        toId: recipientId,
        toModel: 'Users',
        type: notifData.type,
        title: notifData.title,
        description: notifData.description,
        relatedEntityId: null,
        relatedEntityType: 'Message',
        priority: notifData.priority
    });
}

/**
 * SCENARIO 7: Product Approved (Admin to Seller)
 * When: Admin approves a product listing
 * Who gets notified: Seller
 */
async function notifyProductApproved(adminId, sellerId, productId, productName) {
    const notifData = notificationTemplates.PRODUCT_APPROVED(productName);
    await createNotification({
        fromId: adminId,
        fromModel: 'Admins',
        toId: sellerId,
        toModel: 'Users',
        type: notifData.type,
        title: notifData.title,
        description: notifData.description,
        relatedEntityId: productId,
        relatedEntityType: 'Product',
        priority: notifData.priority
    });
}

/**
 * SCENARIO 8: Product Rejected (Admin to Seller)
 * When: Admin rejects a product listing
 * Who gets notified: Seller
 */
async function notifyProductRejected(adminId, sellerId, productId, productName, reason) {
    const notifData = notificationTemplates.PRODUCT_REJECTED(productName, reason);
    await createNotification({
        fromId: adminId,
        fromModel: 'Admins',
        toId: sellerId,
        toModel: 'Users',
        type: notifData.type,
        title: notifData.title,
        description: notifData.description,
        relatedEntityId: productId,
        relatedEntityType: 'Product',
        priority: notifData.priority
    });
}

/**
 * SCENARIO 9: Product Made Available
 * When: Seller marks product as available for rent
 * Who gets notified: Could notify interested buyers (wishlist users)
 */
async function notifyProductAvailable(sellerId, buyerId, productId, productName) {
    const notifData = notificationTemplates.PRODUCT_AVAILABLE(productName);
    await createNotification({
        fromId: sellerId,
        fromModel: 'Users',
        toId: buyerId,
        toModel: 'Users',
        type: notifData.type,
        title: notifData.title,
        description: notifData.description,
        relatedEntityId: productId,
        relatedEntityType: 'Product',
        priority: notifData.priority
    });
}

/**
 * SCENARIO 10: Product Rented
 * When: Product is successfully rented
 * Who gets notified: Seller
 */
async function notifyProductRented(buyerId, sellerId, productId, productName, buyerName) {
    const notifData = notificationTemplates.PRODUCT_RENTED(productName, buyerName);
    await createNotification({
        fromId: buyerId,
        fromModel: 'Users',
        toId: sellerId,
        toModel: 'Users',
        type: notifData.type,
        title: notifData.title,
        description: notifData.description,
        relatedEntityId: productId,
        relatedEntityType: 'Product',
        priority: notifData.priority
    });
}

/**
 * SCENARIO 11: Custom Notification
 * When: Any custom scenario not covered by templates
 */
async function sendCustomNotification({
    fromId,
    fromRole,
    toId,
    toRole,
    type = 'general',
    title,
    description,
    relatedEntityId = null,
    relatedEntityType = null,
    priority = 'medium'
}) {
    await createNotification({
        fromId,
        fromModel: getUserModel(fromRole),
        toId,
        toModel: getUserModel(toRole),
        type,
        title,
        description,
        relatedEntityId,
        relatedEntityType,
        priority
    });
}

// Export all notification helpers
export {
    notifySellerOfProductRequest,
    notifyBuyerRequestAccepted,
    notifyBuyerRequestRejected,
    notifySellerPaymentReceived,
    notifySubscriptionActivation,
    notifyNewMessage,
    notifyProductApproved,
    notifyProductRejected,
    notifyProductAvailable,
    notifyProductRented,
    sendCustomNotification
};
