import mongoose from "mongoose";
import Products from "./Products.js";

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

sellersSchema.pre("findOneAndDelete", async function (next) {
    const seller = await this.model.findOne(this.getQuery());
    if (!seller) return next();

    await Products.deleteMany({
        seller: seller._id,
        soldTo: null,
    });

    next();
});

export default mongoose.model("Sellers",sellersSchema);


// - Create and validate *Buyer Login* and *Signup Forms*.  
// - Implement *Search Filters* with dynamic display of results using *DOM Manipulation*.  
// - Handle *Rent Request Management* with *AJAX* for accept/reject actions.  
// - Backend: *Validation, **Authentication with Passport, **Route Protection using Middleware, **MVC Design, **Logout Logic*.  
// - Frontend: *Admin Dashboard, **Seller Dashboard, **Your Orders Page, **Update Password Form*.  
// - Database: *Sellers* schema.  

