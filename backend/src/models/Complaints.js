import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true,
    },
    complainant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    respondent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: null,
    },
    type: {
        type: String,
        required: true,
        enum: ["product", "general"],
    },
    subject: {
        type: String,
        required: true,
        maxlength: 200,
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000,
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "in_review", "resolved", "dismissed"],
    },
    assignedManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Managers",
        default: null,
    },
    resolution: {
        type: String,
        default: null,
        maxlength: 2000,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

complaintSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

complaintSchema.index({ productId: 1 });
complaintSchema.index({ complainant: 1 });
complaintSchema.index({ assignedManager: 1 });
complaintSchema.index({ status: 1 });

export default mongoose.model("Complaints", complaintSchema);
