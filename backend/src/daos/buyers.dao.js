import Buyers from "../models/Buyers.js";

export const getBuyerById = async (id) => {
    return await Buyers.findById(id);
}

export const createBuyer = async (buyerData) => {
    return await Buyers.create(buyerData);
};

export const findBuyerByEmail = async (email) => {
    return await Buyers.findOne({ email });
};

export const addToWishlistDao = async (userId, productId) => {
    const buyer = await Buyers.findById(userId);

    if (!buyer) return { success: false, reason: "not_found" };

    if (buyer.wishlistProducts.includes(productId)) {
        return { success: false, reason: "already_exists" };
    }

    buyer.wishlistProducts.push(productId);
    await buyer.save();

    return { success: true };
};

export const getWishlistProductsDao = async (userId) => {
    const buyer = await Buyers.findById(userId).populate('wishlistProducts');
    if (!buyer) return { success: false, reason: "not_found" };
    console.log(buyer);
    return {
        success: true,
        products: buyer.wishlistProducts,
        message: "wishlist products received successfully",
    };
}

export const removeFromWishlistDao = async (userId, productId) => {
    const buyer = await Buyers.findById(userId);

    if (!buyer) return { success: false, reason: "not_found" };

    const index = buyer.wishlistProducts.indexOf(productId);
    if (index === -1) {
        return { success: false, reason: "not_in_wishlist" };
    }

    buyer.wishlistProducts.splice(index, 1);
    await buyer.save();

    return { success: true };
};

export const updateBuyerById = async (buyerId, updateData) => {
    return await Buyers.findByIdAndUpdate(
        buyerId,
        { $set: updateData },
        { new: true }
    );
};

export const updateBuyerPassById = async (buyerId, newPassword) => {
    return await Buyers.findByIdAndUpdate(
        buyerId,
        { $set: { password: newPassword } },
        { new: true }
    );
};

// user as a seller
export const findSellerSubsDao = async (userId) => {
    try {
        const seller = await Sellers.findById(userId).select("subscription");
        
        if (!seller) {
            return {
                success: false,
                message: "Seller not found"
            };
        }

        return {
            success: true,
            subscription: seller.subscription
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Database error"
        };
    }
};