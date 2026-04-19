import mongoose from "mongoose";

const pendingPayoutsSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Orders",
        default: null,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        default: null,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: "INR",
    },
    payoutType: {
        type: String,
        required: true,
        enum: [
            "Seller_120_Percent",
            "Buyer_100_Refund",
            "Seller_20_Refund",
            "Buyer_Partial_Refund",
            "Seller_BuyerPool_Share",
            "Seller_Stake_Release",
        ],
    },
    status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Processed", "Failed"],
    },
    reason: {
        type: String,
    },
    withdrawalRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SellerWithdrawal",
        default: null,
    },
    externalPayoutId: {
        type: String,
        default: null,
    },
    idempotencyKey: {
        type: String,
        default: null,
    },
    transferMode: {
        type: String,
        default: null,
        enum: [null, "IMPS", "NEFT", "RTGS", "UPI"],
    },
    payoutProcessedAt: {
        type: Date,
        default: null,
    },
    payoutFailureCode: {
        type: String,
        default: null,
    },
    payoutFailureReason: {
        type: String,
        default: null,
    },
}, {
    timestamps: true
});

pendingPayoutsSchema.index({ status: 1 });
pendingPayoutsSchema.index({ recipientId: 1 });
pendingPayoutsSchema.index({ recipientId: 1, status: 1 });
pendingPayoutsSchema.index({ idempotencyKey: 1 });

export default mongoose.model("PendingPayouts", pendingPayoutsSchema);
