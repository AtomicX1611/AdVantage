import mongoose from "mongoose";

const pendingUsers = new mongoose.Schema({
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
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    profilePicPath: {
        type: String,
        default: null,
    },
    subscription: {
        type: Number,
        default: 0,
        required: true,
    },
    usedPosts: {
        type: Number,
        default: 0
    },
    windowStart: {
        type: Date,
    },
    wishlistProducts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Products",
            default: [],
            required: true,
        },
    ],
    earnings : {
        type:Number,
        default:0
    },
    otp : {
        type:String,
        required:true
    },
    createdAt : {
        type:Date,
        required:true,
        expires :600
    }
});

export default mongoose.model("pendingUsers",pendingUsers);