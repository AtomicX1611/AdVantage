import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    paidTo: {
        type: String,
        required: true
    },
    paymentType: {
        type: String,
        required: true,
        enum: ["purchase", "subscription"]
    },
    price: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Payment", paymentSchema);
