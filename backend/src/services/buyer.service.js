import {
    updateBuyerById,
    addToWishlistDao,
    removeFromWishlistDao,
    getBuyerById,
    updateBuyerPassById,
    getWishlistProductsDao,
} from "../daos/users.dao.js";

import {
    addProductRequestDao,
    getYourProductsDao,
    rentDao,
    paymentDoneDao,
    notInterestedDao,
} from "../daos/products.dao.js";

export const updateBuyerProfileService = async (buyerId, updateData, file) => {

    const allowedFields = ["username", "contact"];
    const filteredData = {};

    for (const key of allowedFields) {
        if (updateData[key] !== undefined) {
            filteredData[key] = updateData[key];
        }
    }

    console.log(file);

    if (Object.keys(filteredData).length === 0 && file === undefined) {
        return {
            success: false,
            status: 400,
            message: "No valid fields to update",
        };
    }

    if (file !== undefined) {
        filteredData.profilePicPath = file.path;
    }

    const updatedBuyer = await updateBuyerById(buyerId, filteredData);

    if (!updatedBuyer) {
        return {
            success: false,
            status: 404,
            message: "Buyer not found",
        };
    }

    return {
        success: true,
        updatedBuyer,
    };
};

export const addToWishlistService = async (userId, productId) => {
    const result = await addToWishlistDao(userId, productId);

    if (!result.success) {
        if (result.reason === "not_found") {
            return { success: false, status: 404, message: "Buyer not found" };
        }
        if (result.reason === "already_exists") {
            return { success: false, status: 400, message: "Product already in wishlist" };
        }
    }

    return { success: true, message: "Product added to wishlist" };
};

export const getWishlistProductsService = async (userId) => {
    const result = await getWishlistProductsDao(userId);

    if (!result.success) {
        if (result.reason === "not_found") {
            return { success: false, status: 404, message: "Buyer not found" };
        }
        return {
            success: false,
            message: "Unknown error...",
        }
    }

    return {
        success: true,
        message: result.message,
        products: result.products,
    };
}

export const removeFromWishlistService = async (userId, productId) => {
    const result = await removeFromWishlistDao(userId, productId);

    if (!result.success) {
        if (result.reason === "not_found") {
            return { success: false, status: 404, message: "Buyer not found" };
        }
        if (result.reason === "not_in_wishlist") {
            return { success: false, status: 400, message: "Product not found in wishlist" };
        }
    }

    return { success: true, message: "Product removed from wishlist" };
};

export const requestProductService = async (productId, buyerId, biddingPrice) => {
    const result = await addProductRequestDao(productId, buyerId, biddingPrice);

    if (!result.success) {
        const messages = {
            not_found: { status: 404, message: "Product not found" },
            self_request: { status: 400, message: "You cannot request your own product" },
            already_sold: { status: 400, message: "Product is already sold" },
            already_requested: { status: 400, message: "You have already requested this product" }
        };
        return { success: false, ...messages[result.reason] };
    }

    return { success: true, message: "Request sent successfully" };
};

export const paymentDoneService = async (buyerId, productId) => {
    const result = await paymentDoneDao(buyerId, productId);
    if (!result.success) {
        const messages = {
            not_found: { status: 404, message: "Product not found" },
            not_accepted_buyer: { status: 400, message: "You are not the accepted buyer for this product" },
            already_sold: { status: 400, message: "Product is already sold" }
        };
        return { success: false, ...messages[result.reason] };
    }

    return { success: true, message: "Payment confirmed successfully" };
};

export const notInterestedService = async (buyerId, productId) => {
    const result = await notInterestedDao(buyerId, productId);

    if (!result.success) {
        const messages = {
            not_found: { status: 404, message: "Product not found" },
            already_sold: { status: 400, message: "Product is already sold" },
            
        };
        return { success: false, ...messages[result.reason] };
    }

    return { success: true, message: "Marked as not interested successfully" };
};

export const updateBuyerPasswordService = async (oldPassword, newPassword, userId) => {
    const buyer = await getBuyerById(userId);
    console.log(buyer);
    if (!buyer) {
        return {
            success: false,
            status: 404,
            message: "buyer not found",
        };
    }
    if (buyer.password !== oldPassword) {
        return {
            success: false,
            status: 401,
            message: "Old password is incorrect",
        };
    }
    const newBuyer = await updateBuyerPassById(userId, newPassword);
    return {
        success: true,
    }
}

export const getYourProductsService = async (buyerId) => {
    const products = await getYourProductsDao(buyerId);

    return {
        success: true,
        message: "Your products retrieved successfully",
        products: products,
    };
}

export const rentService = async (buyerId, productId, from, to) => {
    return await rentDao(buyerId, productId, from, to);
}

export const getYouProfileService = async (buyerId) => {
    const buyer = await getBuyerById(buyerId);
    if (!buyer) {
        return {
            success: false,
            message: "buyer not found",
            status: 404,
        }
    }
    buyer.password = "You fool do you think iam Dumb to give you password";
    return {
        success: true,
        message: "profile fetched successfully",
        status: 200,
        buyer: buyer,
    }
}