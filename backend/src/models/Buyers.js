import mongoose from "mongoose";

const buyersSchema = new mongoose.Schema({
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
        unique : true
    },
    password: {
        type: String,
        required: true,
    },
    profilePicPath: {
        type: String,
        default: null,
    },
    wishlistProducts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Products",
            default: [],
            required: true,
        },
    ],
});

export default mongoose.model("Buyers",buyersSchema);