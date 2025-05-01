import mongoose, { mongo } from 'mongoose';

await mongoose.connect('mongodb://localhost:27017/AdVantage');

//products
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    postingDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    zipCode: {
        type: Number,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sellers',
        required: true
    },
    verified: {
        type: Boolean,
        default: false,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true,
        enum: [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
            'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
            'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
            'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
            'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
        ]
    }
});
const products = mongoose.model('products', productSchema);
await products.collection.createIndex({ name: "text" });
export const findProducts = async function (Name) {
    try {
        const productsList = await products
            .find({ $text: { $search: Name } }, { score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" } })
            .populate('seller');

        return productsList;
    } catch (err) {
        console.error("Error finding products:", err.message);
        throw new Error("Error retrieving products");
    }
};
export const findProduct = async function (prodId) {
    const product =await products.findById(prodId);
    return product;
}
export const addProduct = async function (Name, Price, Description, zipCode, sellerEmail, images, category, district, state, city) {
    try {
        const seller = await findSellerByEmail(sellerEmail);
        if (!seller) {
            throw new Error("Seller not found with provided email");
        }
        const product = {
            name: Name,
            price: Price,
            description: Description,
            zipCode: zipCode,
            postingDate: new Date(), // optional, handled by schema too
            verified: false,
            category: category,
            district: district,
            city: city,
            state: state,
            seller: seller._id
        };
        for(let i=0;i<images.length;i++){
            product[`Image${i+1}Src`]=images[i];
        }
        const result = await products.collection.insertOne(product);
        return result;
    } catch (err) {
        console.error("Error adding product:", err.message);
        throw err;
    }
};
export const verifyProduct = async (productId) => {
    await products.updateOne(
        { _id: productId },
        { $set: { verified: true } }
    );
    return;
}
export const findProductsNotVerified = async () => {
    const rows=await products.find({verified:false});
    return rows;
}
export const findProductsByCategory = async (category) => {
    const rows=await products.find({category: category});
    return rows;
}
export const removeProduct = async (productId) => {
    await products.collection.deleteOne({_id:productId});
    return;
}
export const findProductsBySeller = async function (email) {
    const seller = await findSellerByEmail(email);
    const rows= await products.find({seller:seller._id});
    return rows;
}


//sellers
const sellersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});
const sellers = mongoose.model('sellers', sellersSchema);
export const findSellerByEmail = async (email) => {
    const seller = await sellers.findOne({ email: email });
    return seller;
}
export const createSeller = async (seller) => {
    await users.collection.insertOne(seller);
    return;
};
export const findSellersForAdmin = async () => {
    const result = await sellers.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'seller',
            as: 'products'
          }
        },
        {
          $project: {
            username: 1,
            contact: 1,
            email: 1,
            password: 1,
            numberOfProducts: { $size: '$products' }
          }
        }
      ]);
    return result;
}
export const removeSeller = async (email) => {
    await sellers.collection.deleteOne({email:email});
    return;
}
export const updateSellerPassword = async function (email, password) {
    await sellers.updateOne(
        { email: email },
        { $set: { password: password } }
      );
} 

//users
const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    wishlistProducts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products'
        }
    ]
});
const users = mongoose.model('sellers', sellersSchema);
export const findUserByEmail = async (email) => {
    const user = await users.findOne({ email: email });
    return user;
}
export const createUser = async (user) => {
    await users.collection.insertOne(user);
    return;
};
export const updateBuyerPassword = async function (email, password) {
    await users.updateOne(
      { email: email },
      { $set: { password: password } }
    );
};
export const getWishlistProducts = async function (userEmail) {
    const user=await findUserByEmail(userEmail)
        .populate('wishlistProducts');
    return user.wishlistProducts;
}
export const addToWishlist = function (userEmail, productId) {
    return new Promise(async (resolve, reject) => {
        const user=await findUserByEmail(userEmail);
            if(user.wishlistProducts.includes(productId)){
                reject("Product is already in the wishlist");
            }else{
                await users.updateOne(
                    { email: userEmail },
                    { $push: { wishlistProducts: productId } }
                );
                resolve("Product added to the wishlist successfully");
            }
    });
}
export const removeWishlistProduct = function (userEmail, productId) {
    return new Promise(async (resolve, reject) => {
        await users.updateOne(
            { email: userEmail },
            { $pull: { wishlistProducts: productId } }
        );
    })
}

//admin
const admins = [
    {
        email: "abc@gmail.com",
        password: "12345678"
    }
];
export const findAdmins = (email) => {
    return admins.find(admin => admin.email === email)
}