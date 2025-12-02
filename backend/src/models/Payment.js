import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'fromModel'
    },
    fromModel: {
        type: String,
        required: true,
        enum: ['Users','Admin','Managers']
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'toModel'
    },
    toModel: {
        type: String,
        required: true,
        enum: ['Users','Admin','Managers']
    },
    paymentType: {
        type: String,
        required: true,
        enum: ["purchase", "subscription","other"]
    },
    relatedEntityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    relatedEntityType: {
        type: String,
        enum: ['Products'],
        default: null
    },
    price: {
        type: mongoose.Schema.Types.Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    }
});

export default mongoose.model("Payment", paymentSchema);
