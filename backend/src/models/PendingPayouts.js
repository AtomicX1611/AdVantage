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
        enum: ["Seller_120_Percent", "Buyer_100_Refund", "Seller_20_Refund"],
    },
    status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Processed", "Failed"],
    },
    reason: {
        type: String,
    },
}, {
    timestamps: true
});

pendingPayoutsSchema.index({ status: 1 });
pendingPayoutsSchema.index({ recipientId: 1 });

export default mongoose.model("PendingPayouts", pendingPayoutsSchema);
