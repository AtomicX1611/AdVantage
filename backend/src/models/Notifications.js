import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel',
        index: true,
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['Users', 'Admins', 'Managers'],
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderModel',
        default: null, // null for system-generated notifications
    },
    senderModel: {
        type: String,
        enum: ['Users', 'Admins', 'Managers', null],
        default: null,
    },
    category: {
        type: String,
        required: true,
        enum: [
            // Product-related notifications
            'new_request',           // When a buyer requests a product (for seller)
            'request_accepted',      // When seller accepts buyer's request (for buyer)
            'request_rejected',      // When seller rejects buyer's request (for buyer)
            'request_revoked',       // When seller revokes accepted request (for buyer)
            'product_sold',          // When a product is sold (for seller)
            'product_purchased',     // When buyer successfully purchases (for buyer)
            'product_verified',      // When product is verified by manager (for seller)
            'product_deleted',       // When product is deleted (for seller)
            'product_available',     // When a wishlisted product becomes available (for buyer)
            'outbid',                // When someone outbids on a product (for buyer)
            
            // Payment-related notifications
            'payment_received',      // When payment is received (for seller)
            'payment_made',          // When payment is made successfully (for buyer)
            'subscription_updated',  // When subscription is updated (for user)
            'subscription_expiring', // When subscription is about to expire (for user)
            
            // Chat-related notifications
            'new_message',           // When a new message is received
            'new_contact',           // When a new contact is added
            
            // System notifications
            'account_update',        // Account changes (profile, password, etc.)
            'welcome',               // Welcome message for new users
            'announcement',          // System-wide announcements
            'warning',               // Warnings (e.g., policy violations)
            
            // Admin/Manager notifications
            'verification_pending',  // Product waiting for verification (for manager)
            'user_reported',         // User reported (for admin/manager)
            'new_user_registered',   // New user registered (for admin)
        ],
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    relatedEntity: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedEntityModel',
        default: null,
    },
    relatedEntityModel: {
        type: String,
        enum: ['Products', 'Users', 'Payment', 'Messages', null],
        default: null,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}, // For any additional data like product name, price, etc.
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true,
    },
    readAt: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    expiresAt: {
        type: Date,
        default: null, // null means no expiration
    },
});

// Compound indexes for common queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, category: 1, createdAt: -1 });

// TTL index for auto-deletion of expired notifications (optional)
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

export default mongoose.model("Notifications", notificationSchema);
