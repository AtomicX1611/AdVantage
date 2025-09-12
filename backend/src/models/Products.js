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
        ref: "Sellers",
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
            "test","Mobiles","Electronics"
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
                type: mongoose.Schema.Types.ObjectId,
                ref: "Buyers",
            }
        }
    ],
    soldTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Buyers",
        default: null,
        // required: true,
    },
});

productsSchema.index({ name: "text" });


export default mongoose.model("Products", productsSchema);