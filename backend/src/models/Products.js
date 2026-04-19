import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    postingDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    zipCode: {
        type: String,
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        index: true,
    },
    verified: {
        type: Boolean,
        default: false,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: [
            "Clothes",
            "Mobiles",
            "Laptops",
            "Electronics",
            "Books",
            "Furniture",
            "Automobiles",
            "Sports",
            "Fashion",
            "Musical Instruments",
        ],
        index: true,
    },
    district: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
        enum: [
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
            "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
            "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
            "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
            "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
        ],
    },
    invoice: {
        type: String,
    },
    images: [{
        type: String,
    }],
    requests: [
        {
            buyer: {
                required: true,
                type: mongoose.Schema.Types.ObjectId,
                ref: "Users",
            },
            biddingPrice: {
                type: mongoose.Schema.Types.Number,
                required: true,
            },
            shippingAddress: {
                addressLine: { type: String },
                city: { type: String },
                state: { type: String },
                pinCode: { type: String, required: true },
            },
            sellerStakeId: {
                type: String,
            },
            sellerStakeAmount: {
                type: Number,
            },
            sellerStakeCreatedAt: {
                type: Date,
                default: null,
            },
            sellerStakeStatus: {
                type: String,
                enum: ['Pending', 'Locked', 'Refunded', 'Slashed'],
                default: 'Pending',
            },
            from:{
                type: mongoose.Schema.Types.Date,
            },
            to:{
                type: mongoose.Schema.Types.Date,
            },
        }
    ],
    sellerAcceptedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: null,
    },
    soldTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: null,
        // required: true,
    },
    isRental: {
        type: Boolean,
        required: true
    },
    paymentInProgress: {
        type: Boolean,
        default: false,
    },
    ollama_embeddings: {
        type: [Number],
        default: [],
    },
});

productsSchema.index({ name: "text" });


export default mongoose.model("Products", productsSchema);

//hook need to be written