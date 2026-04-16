import mongoose from "mongoose";
import Products from "./Products.js";

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
    }
});

buyersSchema.pre("findOneAndDelete", async function (next) {
    const seller = await this.model.findOne(this.getQuery());
    if (!seller) return next();

    await Products.deleteMany({
        seller: seller._id,
        soldTo: null,
    });

    next();
});

export default mongoose.model("Users", buyersSchema);