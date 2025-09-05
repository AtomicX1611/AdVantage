import { createProduct } from "../daos/products.dao.js";
import {
    getSellerById,
    updateSellerById,
    updateSellerPassById,
    updateSellerSubscriptionDao
} from "../daos/sellers.dao.js";
import {
    acceptProductRequestDao,
    rejectProductRequestDao
} from "../daos/products.dao.js";

export const addProductService = async (req) => {
    const {
        name,
        price,
        description,
        zipCode,
        category,
        district,
        city,
        state,
    } = req.body;

    if (!req.files?.productImages || req.files.productImages.length === 0) {
        throw new Error("At least one product image is required");
    }

    const images = req.files.productImages.map(file => file.path);
    const invoicePath = req.files.invoice?.[0]?.path || null;

    const productData = {
        name,
        price,
        description,
        zipCode,
        category,
        district,
        city,
        state,
        seller: req.user._id,
        images,
        invoice: invoicePath,
        soldTo: null,
    };

    const newProduct = await createProduct(productData);
    return newProduct;
};

export const updateSellerProfileService = async (sellerId, updateData, file) => {
    const allowedFields = ["username", "contact"];
    const filteredData = {};

    for (const key of allowedFields) {
        if (updateData[key] !== undefined) {
            filteredData[key] = updateData[key];
        }
    }

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

    const updatedSeller = await updateSellerById(sellerId, filteredData);

    if (!updatedSeller) {
        return {
            success: false,
            status: 404,
            message: "Seller not found",
        };
    }
    const plainSeller = updatedSeller.toObject();
    delete plainSeller.password;

    return {
        success: true,
        updatedSeller: plainSeller,
    };
};

export const updateSellerSubscriptionService = async (sellerId, subscription) => {
    const seller = await getSellerById(sellerId);
    if(seller.subscription>=subscription){
        return {
            success: false,
            message: "Seller already have better or Equal plan than the choosen one",
        };
    }
    seller.subscription=subscription;
    await seller.save();
    // const response = await updateSellerSubscriptionDao(sellerId,subscription);
    return {
        success: true,
        updatedSeller: seller,
    }
}

export const acceptProductRequestService = async (productId, buyerId) => {
    const result = await acceptProductRequestDao(productId, buyerId);

    if (!result.success) {
        const messages = {
            not_found: { status: 404, message: "Product not found" },
            already_sold: { status: 400, message: "Product already sold" },
            no_request: { status: 400, message: "No request from this buyer" }
        };
        return { success: false, ...messages[result.reason] };
    }

    return { success: true, message: "Request accepted and product marked as sold" };
};

export const rejectProductRequestService = async (productId, buyerId) => {
    const result = await rejectProductRequestDao(productId, buyerId);

    if (!result.success) {
        const messages = {
            not_found: { status: 404, message: "Product not found" },
            no_request: { status: 400, message: "No request from this buyer" }
        };
        return { success: false, ...messages[result.reason] };
    }

    return { success: true, message: "Request rejected successfully" };
};

export const updateSellerPasswordService = async (oldPassword, newPassword, userId) => {
    const seller = await getSellerById(userId);
    if (!seller) {
        return {
            success: false,
            status: 404,
            message: "Seller not found",
        };
    }

    if (seller.password !== oldPassword) {
        return {
            success: false,
            status: 401,
            message: "Old password is incorrect",
        };
    }

    await updateSellerPassById(userId, newPassword);

    return {
        success: true,
    };
};