import mongoose from "mongoose";

const sellerWithdrawalSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    eligibleAmountSnapshot: {
        type: Number,
        required: true,
    },
    withdrawnAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Initiated", "Processing", "Processed", "Failed"],
        default: "Initiated",
    },
    initiatedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    failedAt: {
        type: Date,
        default: null,
    },
    failureReason: {
        type: String,
        default: null,
    },
    payoutAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SellerPayoutAccount",
        required: true,
    },
    fundAccountId: {
        type: String,
        required: true,
    },
    externalPayoutId: {
        type: String,
        default: null,
    },
    idempotencyKey: {
        type: String,
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
});

sellerWithdrawalSchema.index({ sellerId: 1, status: 1 });

export default mongoose.model("SellerWithdrawal", sellerWithdrawalSchema);
