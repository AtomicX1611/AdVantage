import mongoose from "mongoose";
import { paymentDoneHelper, updateSellerSubscriptionHelper } from "../helpers/user.helper.js";

const orderSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
    },
    subscription: {
        type: Number,
        default: 0
    },
    id: {
        type: String,
        index: true,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    receipt: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "created",
        enum: ["created", "paid", "failed"]
    },
    paymentId: {
        type: String,
        default: null,
    },
    paymentProcessed: {
        type: Boolean,
        default: false,
    },
    paymentProcessedAt: {
        type: Date,
        default: null,
    },
    notes: {
        type: Object,
        required: true,
    },
    awbCode: {
        type: String,
    },
    courierName: {
        type: String,
    },
    deliveryStatus: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Shipped", "Delivered", "Disputed", "Completed"],
    },
    deliveredAt: {
        type: Date,
    },
    timerTriggered48Hour: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});

const runPaidHook = async (orderDoc) => {
    if (!orderDoc) return;
    if (orderDoc.status !== "paid") return;
    if (orderDoc.paymentProcessed) return;
    if (!orderDoc.paymentId) return;

    if (orderDoc.productId) {
        const result = await paymentDoneHelper(orderDoc.buyerId, orderDoc.productId, orderDoc.paymentId);
        if (!result?.success) {
            throw new Error(result?.message || "Failed to finalize product payment");
        }
    } else if (orderDoc.subscription) {
        const result = await updateSellerSubscriptionHelper(orderDoc.buyerId, orderDoc.subscription, orderDoc.paymentId);
        if (!result?.success) {
            throw new Error(result?.message || "Failed to finalize subscription payment");
        }
    }

    orderDoc.paymentProcessed = true;
    orderDoc.paymentProcessedAt = new Date();
    await orderDoc.save();
};

orderSchema.post("save", async function postSavePaidHook() {
    await runPaidHook(this);
});

orderSchema.post("findOneAndUpdate", async function postUpdatePaidHook(updatedDoc) {
    await runPaidHook(updatedDoc);
});

export default mongoose.model("Orders", orderSchema);