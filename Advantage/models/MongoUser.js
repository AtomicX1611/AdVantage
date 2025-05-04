import mongoose, { mongo } from 'mongoose';
import { sellersdummy,productsdummy } from './Products.js';

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
        type: String,
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
            .populate('seller').lean();
        return productsList;
    } catch (err) {
        console.error("Error finding products:", err.message);
        throw new Error("Error retrieving products");
    }
};
export const findProduct = async function (prodId) {
    const product =await products.findById(prodId).populate('seller').lean();
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
    return true;
}
export const findProductsNotVerified = async () => {
    const rows=await products.find({verified:false}).populate('seller');
    return rows;
}
export const findProductsByCategory = async (category) => {
    const rows=await products.find({category: category}).lean();
    return rows;
}
export const removeProduct = async (productId) => {
    await products.collection.deleteOne({_id:productId});
    return;
}
export const findProductsBySeller = async function (email) {
    const seller = await findSellerByEmail(email);
    const rows= await products.find({seller:seller._id}).lean();
    return rows;
}

// adding featured product and fresh product fetching functions:
export const featuredProducts = async () => {
    try {
        const rows = await products.find().limit(10).lean();

        // for (let row of rows) {
        //     let Images = await findImages(row._id);
        //     for (let j = 0; j < Images.length; j++) {
        //         row[`Image${j + 1}Src`] = Images[j].Image;
        //     }
        // }
        return rows;
    } catch (err) {
        throw err;
    }
};

export const freshProducts = async () => {
    try {
        const rows = await products.find().skip(10).limit(15).lean();

        // for (let row of rows) {
        //     let Images = await findImages(row._id);
        //     for (let j = 0; j < Images.length; j++) {
        //         row[`Image${j + 1}Src`] = Images[j].Image;
        //     }
        // }

        return rows;
    } catch (err) {
        throw err;
    }
};

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
            ref: 'products',
            default:[]
        }
    ]
});
const users = mongoose.model('users', usersSchema);
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
    const user=await users.findOne({ email: userEmail })
        .populate({
            path:'wishlistProducts',
            populate: {
                path: 'seller'
            }
        }).lean();
    return user.wishlistProducts;
}
export const addToWishlist = function (userEmail, productId) {
    return new Promise(async (resolve, reject) => {
        // const user=await findUserByEmail(userEmail);
            await users.updateOne(
                { email: userEmail },
                { $addToSet: { wishlistProducts: productId } }
            );
            resolve("Product added to the wishlist successfully");
    });
}
export const removeWishlistProduct = function (userEmail, productId) {
    return new Promise(async (resolve, reject) => {
        await users.updateOne(
            { email: userEmail },
            { $pull: { wishlistProducts: productId } }
        );
        resolve("Product removed");
    })
}
export const findUsersForAdmin = async () => {
    return await users.find();
};

//admin
const admins = [
    {
        email: "abc@gmail.com",
        password: "12345678"
    }
];
export const findAdmins = (email) => {
    return admins.find(admin => admin.email === email);
};

//conversation
const conversationSchema = new mongoose.Schema({
    sellerMail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    sender: {
        type: String,
        default: null,
        trim: true,
        lowercase: true
    },
    buyerMail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    collection: 'conversation'
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export const findMessages = async (seller, buyer) => {
    try {
        const rows = await Conversation.find({ buyerMail: buyer, sellerMail: seller }, 'sellerMail');
        return rows;
    } catch (err) {
        throw err;
    }
};

export const findSendersForEmail = async (buyer) => {
    try {
        const rows = await Conversation.find({ buyerMail: buyer }).distinct('sellerMail');
        return rows.map(email => ({ sellerMail: email }));
    } catch (err) {
        throw err;
    }
};

export const findSendersForSeller = async (seller) => {
    try {
        const rows = await Conversation.find({ sellerMail: seller }).distinct('buyerMail');
        return rows.map(email => ({ buyerMail: email }));
    } catch (err) {
        throw err;
    }
};

export const createContact = async (seller, buyer) => {
    try {
        const date = new Date();
        const message = '__init';

        await Conversation.create({
            sellerMail: seller,
            buyerMail: buyer,
            message: message,
            date: date
        });

        return {
            message: 'Contact created successfully!',
            sellerMail: seller,
            buyerMail: buyer,
            date: date
        };
    } catch (err) {
        throw err;
    }
};

export const senderList = async (result) => {
    try {
        if (result.length === 0) return [];

        const sellerEmails = result.map(item => item.sellerMail);
        const rows = await Seller.find({ email: { $in: sellerEmails } }, 'username email');

        return rows.map(({ username, email }) => ({ senderUsername: username, sender: email }));
    } catch (err) {
        throw err;
    }
};

export const buyerList = async (result) => {
    try {
        if (result.length === 0) return [];

        const buyerEmails = result.map(item => item.buyerMail);
        const rows = await User.find({ email: { $in: buyerEmails } }, 'username email');

        return rows.map(({ username, email }) => ({ senderUsername: username, sender: email }));
    } catch (err) {
        throw err;
    }
};

export const fetchConversations = async (sellerMail, buyerMail) => {
    console.log("entered fetchConversations in user.js", sellerMail, buyerMail);
    try {
        const rows = await Conversation.find({
            $or: [
                { sellerMail: sellerMail, buyerMail: buyerMail },
                { sellerMail: buyerMail, buyerMail: sellerMail }
            ]
        }).sort({ date: 1 });
        return rows;
    } catch (err) {
        throw err;
    }
};

//sender field added extra in this..................
export const saveMessage = async (sellerMail, buyerMail, message, sender) => {
    try {
        const currentDateTime = new Date();

        const doc = await Conversation.create({
            sellerMail,
            sender,
            buyerMail,
            message,
            date: currentDateTime
        });

        return {
            sellerMail,
            sender,
            buyerMail,
            message,
            date: currentDateTime
        };
    } catch (err) {
        throw err;
    }
};




//dummy data
// sellers.collection.insertOne(sellersdummy[0]);
// for (let i = 0; i < productsdummy.length; i++) {
//     await addProduct(
//         productsdummy[i].name,
//         productsdummy[i].price,
//         productsdummy[i].description,
//         productsdummy[i].zipcode,
//         productsdummy[i].sellerEmail,
//         productsdummy[i].images,
//         productsdummy[i].category,
//         productsdummy[i].district,
//         productsdummy[i].state,
//         productsdummy[i].city
//     );
// }