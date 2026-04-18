import mongoose from "mongoose";

const sellerPayoutAccountSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    accountType: {
        type: String,
        enum: ["bank", "upi"],
        required: true,
    },
    holderName: {
        type: String,
        required: true,
        trim: true,
    },
    accountNumberMasked: {
        type: String,
        default: null,
    },
    ifsc: {
        type: String,
        default: null,
        uppercase: true,
        trim: true,
    },
    upiId: {
        type: String,
        default: null,
        trim: true,
    },
    razorpayContactId: {
        type: String,
        required: true,
    },
    razorpayFundAccountId: {
        type: String,
        required: true,
    },
    verificationStatus: {
        type: String,
        enum: ["Verified", "Failed"],
        default: "Verified",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

sellerPayoutAccountSchema.index({ sellerId: 1, isActive: 1 }, { unique: true });
sellerPayoutAccountSchema.index({ sellerId: 1 });

export default mongoose.model("SellerPayoutAccount", sellerPayoutAccountSchema);
