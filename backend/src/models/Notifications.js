import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'fromModel'
    },
    fromModel: {
        type: String,
        required: true,
        enum: ['Users', 'Admins', 'Managers']
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'toModel'
    },
    toModel: {
        type: String,
        required: true,
        enum: ['Users', 'Admins', 'Managers']
    },
    type: {
        type: String,
        required: true,
        enum: [
            'order_placed',
            'order_confirmed',
            'order_shipped',
            'order_delivered',
            'payment_received',
            'payment_failed',
            'product_approved',
            'product_rejected',
            'subscription_activated',
            'subscription_expired',
            'wishlist_price_drop',
            'new_message',
            'seller_approved',
            'seller_rejected',
            'general'
        ]
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    relatedEntityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    relatedEntityType: {
        type: String,
        enum: ['Product', 'Order', 'Payment', null],
        default: null
    },
    isRead: {
        type: Boolean,
        default: false,
        required: true
    },
    readAt: {
        type: Date,
        default: null
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ to: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ from: 1, createdAt: -1 });

// Auto-delete read notifications older than 30 days
notificationSchema.index({ readAt: 1 }, { 
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { isRead: true }
});

export default mongoose.model("Notifications", notificationSchema);
