import mongoose from "mongoose";

const sellersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    subscription: {
        type: Number,
        default: 0,
        required:true,
    },
    profilePicPath: {
        type: String,
        default: null,
    },
});

export default mongoose.model("Sellers",sellersSchema);