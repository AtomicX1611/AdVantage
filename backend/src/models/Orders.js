import mongoose from "mongoose";

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
    notes: {
        type: Object,
        required: true,
    },
}, {
    timestamps: true
});

export default mongoose.model("Orders", orderSchema);