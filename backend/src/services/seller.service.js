import {
    createProduct,
    getProductById,
    deleteProductDao,
    acceptProductRequestDao,
    rejectProductRequestDao,
    makeAvailableDao,
    // findProducts,
    // countProductsDao,
    revokeAcceptedRequestDao,
} from "../daos/products.dao.js";
// import {
// getSellerById,
// updateSellerById,
// updateSellerPassById,
// updateSellerSubscriptionDao
// findSellerSubsDao,
// } from "../daos/sellers.dao.js";
import {
    getBuyerById,
    findSellerSubsDao,
    incrementUsedPostsDao,
    resetUsedPostsDao,
} from "../daos/users.dao.js"

import {
    findProductsForSeller,
} from "../daos/products.dao.js";

import { createPayment, getPaymentsByFrom, getPaymentsByTo } from "../daos/payment.dao.js";

import { getAdminById, getAllAdmins } from "../daos/admins.dao.js";
import {
    createRequestAcceptedNotification,
    createRequestRejectedNotification,
    createRequestRevokedNotification,
} from "../helpers/notification.helper.js";
import { generateProductOllamaEmbedding } from "../helpers/productEmbedding.helper.js";

export const addProductService = async (req) => {
    // Old implementation of isAllowed function which is slow
    // async function isAllowed(sellerId) {
    //     const arr = [10000, 50, 100];
    //     const oneMonthAgo = new Date();
    //     oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    //     const filters = {
    //         seller: sellerId,
    //         postingDate: { $gte: oneMonthAgo },
    //     }
    //     const count = await countProductsDao(filters);
    //     const subscription = (await findSellerSubsDao(sellerId)).subscription;
    //     console.log("subscription : " + subscription + " count : " + count);
    //     return (count < arr[subscription]);
    // }

    async function isAllowed(sellerId) {
        const arr = [10001, 50, 100];
        const seller = (await getBuyerById(sellerId));
        // console.log(seller.windowStart);
        if (!seller.windowStart || new Date(seller.windowStart).getFullYear() !== new Date().getFullYear() || new Date(seller.windowStart).getMonth() !== new Date().getMonth()) {
            await resetUsedPostsDao(sellerId);
            seller.usedPosts = 0;
        }
        // console.log("subscription : " + seller.subscription + " usedPosts : " + seller.usedPosts);
        return (seller.usedPosts < arr[seller.subscription]);
    }


    const {
        name,
        price,
        description,
        zipCode,
        category,
        district,
        city,
        state,
        isRental
    } = req.body;
    // console.log(req.body);

    // console.log("fkldsj");

    const allowed = await isAllowed(req.user._id);
    if (!allowed) {
        throw new Error("You exceeded your plan's limit per month");
    }
    if (!req.cloudinary?.productImages || req.cloudinary.productImages.length === 0) {
        throw new Error("At least one product image is required");
    }

    // const images = req.files.productImages.map(file => file.path);
    // const invoicePath = req.files.invoice?.[0]?.path || null;
    const images = req.cloudinary.productImages.map(img => img.url);
    const invoicePath = req.cloudinary.invoice?.url || null;
    
    const isRental1 = (isRental == 'true' || isRental == true) ? true : false;

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
        isRental: isRental1,
        invoice: invoicePath,
        soldTo: null,
    };

    try {
        const { vector } = await generateProductOllamaEmbedding(productData);
        if (Array.isArray(vector) && vector.length > 0) {
            productData.ollama_embeddings = vector;
        }
    } catch (error) {
        console.error("Failed to generate Ollama embedding for addProduct:", error?.message || error);
    }

    // console.log("product data: ", productData);
    const newProduct = await createProduct(productData);
    await incrementUsedPostsDao(req.user._id);
    return newProduct;
};

export const deleteProductService = async (sellerId, productId) => {
    try {
        // console.log("Ali told");
        const product = await getProductById(productId);
        if (!product) {
            return {
                success: false,
                status: 404,
                message: "Product not found"
            };
        }
        // console.log(" this "+sellerId.toString()+" , "+product.seller.toString());


        if (product.seller._id.toString() !== sellerId.toString()) {
            return {
                success: false,
                status: 403,
                message: "Unauthorized: You can delete only your own products"
            };
        }

        await deleteProductDao(productId);

        return {
            success: true,
            status: 200,
            message: "Product deleted successfully"
        };

    } catch (error) {
        console.error("Delete Product Service Error:", error);
        return {
            success: false,
            status: 500,
            message: error.message || "Internal server error"
        };
    }
};


// export const updateSellerProfileService = async (sellerId, updateData, file) => {
//     const allowedFields = ["username", "contact"];
//     const filteredData = {};

//     for (const key of allowedFields) {
//         if (updateData[key] !== undefined) {
//             filteredData[key] = updateData[key];
//         }
//     }

//     if (Object.keys(filteredData).length === 0 && file === undefined) {
//         return {
//             success: false,
//             status: 400,
//             message: "No valid fields to update",
//         };
//     }

//     if (file !== undefined) {
//         filteredData.profilePicPath = file.path;
//     }

//     const updatedSeller = await updateSellerById(sellerId, filteredData);

//     if (!updatedSeller) {
//         return {
//             success: false,
//             status: 404,
//             message: "Seller not found",
//         };
//     }
//     const plainSeller = updatedSeller.toObject();
//     delete plainSeller.password;

//     return {
//         success: true,
//         updatedSeller: plainSeller,
//     };
// };

export const acceptProductRequestService = async (productId, buyerId) => {
    const result = await acceptProductRequestDao(productId, buyerId);

    if (!result.success) {
        const messages = {
            not_found: { status: 404, message: "Product not found" },
            already_sold: { status: 400, message: "Product already sold" },
            no_request: { status: 400, message: "No request from this buyer" },
            already_accepted: { status: 400, message: "A request has already been accepted for this product" }
        };
        return { success: false, ...messages[result.reason] };
    }
    await createRequestAcceptedNotification(
        buyerId,
        result.sellerId,
        productId,
        result.productName
    );
    return { success: true, message: "Request accepted and notification sent to the buyer" };
};

export const revokeAcceptedRequestService = async (productId) => {
    const result = await revokeAcceptedRequestDao(productId);
    if (!result.success) {
        const messages = {
            not_found: { status: 404, message: "Product not found" },
            already_sold: { status: 400, message: "Product already sold" },
            no_accepted_request: { status: 400, message: "No accepted request to revoke" },
            payment_in_progress: { status: 400, message: "Cannot revoke accepted request while payment is in progress" }
        };
        return { success: false, ...messages[result.reason] };
    }
    await createRequestRevokedNotification(
        result.buyerId,
        result.sellerId,
        productId,
        result.productName
    );
    return { success: true, message: "Accepted request revoked successfully" };
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
    await createRequestRejectedNotification(
        buyerId,
        result.sellerId,
        productId,
        result.productName
    );
    return { success: true, message: "Request rejected successfully" };
};

// export const updateSellerPasswordService = async (oldPassword, newPassword, userId) => {
//     const seller = await getSellerById(userId);
//     if (!seller) {
//         return {
//             success: false,
//             status: 404,
//             message: "Seller not found",
//         };
//     }

//     if (seller.password !== oldPassword) {
//         return {
//             success: false,
//             status: 401,
//             message: "Old password is incorrect",
//         };
//     }

//     await updateSellerPassById(userId, newPassword);

//     return {
//         success: true,
//     };
// };

export const sellerProdRetriveService = async (id) => {
    return await findProductsForSeller(id);
}

export const sellerSubsRetService = async (userId) => {
    return await findSellerSubsDao(userId);
}

export const updateSellerSubscriptionService = async () => {
    return {
        success: false,
        status: 410,
        message: "Subscription update must go through create-order and verify-payment flow",
    };
}

export const makeAvailableService = async (sellerId, productId) => {
    try {
        const result = await makeAvailableDao(sellerId, productId);

        if (!result.success) {
            return {
                status: 400,
                success: false,
                message: result.message || "Could not make product available again"
            };
        }

        return {
            status: 200,
            success: true,
            message: "Product marked as available again",
            product: result.product
        };
    } catch (error) {
        console.error("Error in makeAvailableService:", error);
        return {
            success: false,
            message: "Internal server error while updating availability"
        };
    }
};

export const analyticsService = async (sellerId) => {
    try {
        const user = await getBuyerById(sellerId);
        if (!user) {
            return {
                status: 404,
                success: false,
                message: "Seller not found"
            }
        }
        const earnings = user.earnings;

        const userProducts = await findProductsForSeller(sellerId);
        if (!userProducts.success) {
            return {
                status: 409,
                success: false,
                message: "Could not load products"
            }
        }
        const products = userProducts.products;
        let itemsSold = 0;
        let activeRentals = 0;
        let pendingRequest = 0;

        let itemsForSale = 0;
        let itemsToRent = 0;

        const revPerCat = {
            "Clothes": 0,
            "Mobiles": 0,
            "Laptops": 0,
            "Electronics": 0,
            "Books": 0,
            "Furniture": 0,
            "Automobiles": 0,
            "Sports": 0,
            "Fashion": 0,
            "Musical Instruments": 0
        };

        products.forEach(prod => {
            pendingRequest += prod.requests?.length || 0;

            if (prod.isRental) {
                if (prod.soldTo != null) {
                    revPerCat[prod.category] += prod.price;
                    activeRentals++;
                } else {
                    itemsToRent++;
                }
            }
            else {
                if (prod.soldTo != null) {
                    revPerCat[prod.category] += prod.price;
                    itemsSold++;
                }
                else {
                    itemsForSale++;
                }
            }
        });

        return {
            status: 200,
            success: true,
            message: "Analytics found",
            data: {
                earnings,
                pendingRequest,
                itemsForSale,
                itemsSold,
                itemsToRent,
                activeRentals,
                revPerCat
            }
        }
    } catch (error) {
        console.log("err at analytics: ", error);
        return {
            status: 500,
            message: "Internal server err",
            success: false
        }
    }
}

export const getTransactionsService = async (userId) => {
    try {
        const rcvd = await getPaymentsByTo(userId, 'Users');
        console.log('received: ', rcvd);
        const paid = await getPaymentsByFrom(userId, 'Users');

        return {
            status: 200,
            received: rcvd,
            paidTo: paid
        }
    } catch (error) {
        console.log(error);
        return {
            status: 500,
            message: "Internal server err",
            success: false
        }
    }

}