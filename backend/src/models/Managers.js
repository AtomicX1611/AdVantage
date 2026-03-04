import mongoose from "mongoose";

const managerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
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
    },
});

export default mongoose.model("Managers", managerSchema);