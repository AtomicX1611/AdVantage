import {
    createProduct,
    getProductById,
    deleteProductDao,
    acceptProductRequestDao,
    rejectProductRequestDao,
    // findProducts,
    // countProductsDao,
    revokeAcceptedRequestDao,
    createStakeOrderDao,
    verifyStakeDao,
} from "../daos/products.dao.js";
import { razorpay } from "../config/payment.config.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
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

import { shipOrderDao, verifyDeliveryDao, markOrderDeliveredDao, getSellerOrdersDao, sellerCancelPaidOrderDao } from "../daos/orders.dao.js";
import Order from "../models/Orders.js";

import { createPayment, getPaymentsByFrom, getPaymentsByTo } from "../daos/payment.dao.js";

import { getAdminById, getAllAdmins } from "../daos/admins.dao.js";
import {
    createRequestAcceptedNotification,
    createRequestRejectedNotification,
    createRequestRevokedNotification,
} from "../helpers/notification.helper.js";
import { generateProductHFEmbedding } from "../helpers/productEmbedding.helper.js";
import PendingPayouts from "../models/PendingPayouts.js";
import {
    createPayoutAccountDao,
    createSellerWithdrawalDao,
    getActivePayoutAccountBySellerDao,
    getProcessingWithdrawalBySellerDao,
    getSellerWithdrawalsDao,
    getWithdrawablePayoutsDao,
    markPayoutsAsLinkedToWithdrawalDao,
    markWithdrawalPayoutExecutionDao,
    unlinkPayoutsFromWithdrawalDao,
    updateSellerWithdrawalDao,
} from "../daos/payout.dao.js";
import { createImmediateSellerPayout, createSellerFundAccount } from "./payout.service.js";

const roundAmount = (value) => Number((value || 0).toFixed(2));

const WITHDRAWABLE_PAYOUT_TYPES = [
    "Seller_120_Percent",
    "Seller_20_Refund",
    "Seller_BuyerPool_Share",
    "Seller_Stake_Release",
    "Buyer_100_Refund",
    "Buyer_Partial_Refund",
];

const maskAccountNumber = (raw) => {
    const value = String(raw || "").trim();
    if (value.length <= 4) return value;
    return `${"*".repeat(Math.max(value.length - 4, 4))}${value.slice(-4)}`;
};

const payoutTitleMap = {
    Seller_120_Percent: "Seller Settlement (120%)",
    Seller_20_Refund: "Seller Stake Refund",
    Seller_BuyerPool_Share: "Seller Share from Buyer Pool",
    Seller_Stake_Release: "Seller Stake Release",
    Buyer_100_Refund: "Buyer Refund",
    Buyer_Partial_Refund: "Buyer Partial Refund",
};

const getPayoutStatusMeta = (payout) => {
    const isWithdrawableType = WITHDRAWABLE_PAYOUT_TYPES.includes(payout.payoutType);

    if (payout.status === "Processed" && payout.withdrawalRequestId) {
        return { displayStatus: "Withdrawn", statusClass: "success", isRealizedIncome: true };
    }
    if (payout.status === "Processed") {
        return { displayStatus: "Available to Withdraw", statusClass: "success", isRealizedIncome: true };
    }
    if (payout.status === "Pending" && isWithdrawableType && !payout.withdrawalRequestId) {
        return { displayStatus: "Ready to Withdraw", statusClass: "success", isRealizedIncome: true };
    }
    if (payout.withdrawalRequestId && payout.status === "Pending") {
        return { displayStatus: "Withdrawal In Progress", statusClass: "pending", isRealizedIncome: true };
    }
    if (payout.status === "Failed") {
        return { displayStatus: "Payout Failed", statusClass: "failed", isRealizedIncome: false };
    }
    return { displayStatus: "Awaiting Payout", statusClass: "pending", isRealizedIncome: false };
};

const getPaymentEventStatusMeta = (order, hasProcessedPayout, hasPendingPayout) => {
    if (!order) {
        return {
            displayStatus: "Payment Received (Escrow Hold)",
            statusClass: "pending",
            isRealizedIncome: false,
            displayTitle: "Buyer Payment Received",
        };
    }

    if (hasProcessedPayout) {
        return {
            displayStatus: "Settled",
            statusClass: "success",
            isRealizedIncome: true,
            displayTitle: "Buyer Payment (Settled)",
        };
    }

    if (hasPendingPayout) {
        return {
            displayStatus: "Settlement Pending Payout",
            statusClass: "pending",
            isRealizedIncome: false,
            displayTitle: "Buyer Payment (Settlement Queued)",
        };
    }

    if (order.deliveryStatus === "Disputed") {
        return {
            displayStatus: "Under Dispute Hold",
            statusClass: "pending",
            isRealizedIncome: false,
            displayTitle: "Buyer Payment (Dispute Hold)",
        };
    }

    if (order.deliveryStatus === "Delivered") {
        return {
            displayStatus: "48h Review Window",
            statusClass: "pending",
            isRealizedIncome: false,
            displayTitle: "Buyer Payment (In Review Window)",
        };
    }

    if (order.deliveryStatus === "Shipped") {
        return {
            displayStatus: "Awaiting Delivery Confirmation",
            statusClass: "pending",
            isRealizedIncome: false,
            displayTitle: "Buyer Payment (In Transit)",
        };
    }

    if (order.deliveryStatus === "Pending") {
        return {
            displayStatus: "Awaiting Seller Delivery Update",
            statusClass: "pending",
            isRealizedIncome: false,
            displayTitle: "Buyer Payment (Seller Action Pending)",
        };
    }

    if (order.deliveryStatus === "Completed") {
        return {
            displayStatus: "Settlement In Progress",
            statusClass: "pending",
            isRealizedIncome: false,
            displayTitle: "Buyer Payment (Completed Order)",
        };
    }

    return {
        displayStatus: "Payment Received (Escrow Hold)",
        statusClass: "pending",
        isRealizedIncome: false,
        displayTitle: "Buyer Payment Received",
    };
};

import { cacheGet, cacheSet, cacheDel, invalidateProductCaches, KEYS, TTL } from "../config/cache.config.js";
import cloudinary from "../config/cloudinary.config.js";

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
        state
    } = req.body;
    // console.log(req.body);

    // console.log("fkldsj");
    const sellerId = req.user._id;

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

    try {
        const { vector } = await generateProductHFEmbedding(productData);
        if (Array.isArray(vector) && vector.length > 0) {
            productData.hf_embeddings = vector;
        }
    } catch (error) {
        console.error("Failed to generate HF embedding for addProduct:", error?.message || error);
    }

    // console.log("product data: ", productData);
    const newProduct = await createProduct(productData);
    await incrementUsedPostsDao(req.user._id);

    await invalidateProductCaches(null, sellerId);

    return newProduct;
};

export const deleteProductService = async (sellerId, productId) => {
    try {
        const product = await getProductById(productId);
        if (!product) {
            return {
                success: false,
                status: 404,
                message: "Product not found"
            };
        }

        if (product.seller._id.toString() !== sellerId.toString()) {
            return {
                success: false,
                status: 403,
                message: "Unauthorized: You can delete only your own products"
            };
        }

        // Attempt to delete associated files from Cloudinary (images + invoice)
        const extractPublicIdFromUrl = (url) => {
            try {
                const parsed = new URL(url);
                let pathname = parsed.pathname || parsed.path || ""; // e.g. /image/upload/v1234/products/...

                const uploadIdx = pathname.indexOf("/upload/");
                let afterUpload = uploadIdx !== -1 ? pathname.substring(uploadIdx + "/upload/".length) : pathname;

                // Remove version prefix if present (v123456789/)
                const versionMatch = afterUpload.match(/^v\d+\//);
                if (versionMatch) afterUpload = afterUpload.substring(versionMatch[0].length);

                // Strip leading slash if any and file extension
                if (afterUpload.startsWith('/')) afterUpload = afterUpload.substring(1);
                afterUpload = afterUpload.replace(/\.[^/.]+$/, "");

                return afterUpload;
            } catch (err) {
                return null;
            }
        };

        const deletionTasks = [];

        if (Array.isArray(product.images)) {
            for (const imgUrl of product.images) {
                const publicId = extractPublicIdFromUrl(imgUrl);
                if (!publicId) continue;
                deletionTasks.push((async () => {
                    try {
                        const res = await cloudinary.uploader.destroy(publicId);
                        console.log(`Cloudinary destroy result for ${publicId}:`, res);
                    } catch (err) {
                        console.error(`Cloudinary destroy error for ${publicId}:`, err);
                    }
                })());
            }
        }

        if (product.invoice) {
            const publicId = extractPublicIdFromUrl(product.invoice);
            if (publicId) {
                deletionTasks.push((async () => {
                    try {
                        let res = await cloudinary.uploader.destroy(publicId);
                        // If not found as image, try raw resource type (pdfs, docs)
                        if (res && res.result === 'not_found') {
                            res = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
                        }
                        console.log(`Cloudinary destroy result for invoice ${publicId}:`, res);
                    } catch (err) {
                        console.error(`Cloudinary destroy error for invoice ${publicId}:`, err);
                    }
                })());
            }
        }

        try {
            await Promise.all(deletionTasks);
        } catch (err) {
            console.error('Error deleting some Cloudinary resources:', err);
        }

        await deleteProductDao(productId);

        await invalidateProductCaches(productId, sellerId);

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

    // Product state changed (sellerAcceptedTo set) — invalidate caches
    await invalidateProductCaches(productId, result.sellerId);

    await createRequestAcceptedNotification(
        buyerId,
        result.sellerId,
        productId,
        result.productName
    );
    return { success: true, message: "Request accepted and notification sent to the buyer" };
};

export const createStakeOrderService = async (productId, buyerId) => {
    const product = await getProductById(productId);
    if (!product) return { status: 404, success: false, message: "Product not found" };

    const request = product.requests.find(req => req.buyer._id ? req.buyer._id.toString() === buyerId.toString() : req.buyer.toString() === buyerId.toString());
    if (!request) return { status: 404, success: false, message: "Request not found" };

    if (request.sellerStakeStatus === 'Locked' || (product.sellerAcceptedTo && product.sellerAcceptedTo.toString() === buyerId.toString())) {
        return { status: 400, success: false, message: "Request already accepted. Stake already deposited." };
    }

    const stakeExpiryMinutes = Number.parseInt(process.env.STAKE_ORDER_EXPIRY_MINUTES || "30", 10);
    const isStakeExpired = request.sellerStakeCreatedAt
        ? (Date.now() - new Date(request.sellerStakeCreatedAt).getTime()) > stakeExpiryMinutes * 60 * 1000
        : false;

    // Fresh requests also default to Pending. Treat as "in progress" only when a non-expired stake order exists.
    if (request.sellerStakeStatus === 'Pending' && request.sellerStakeId && !isStakeExpired) {
        return { status: 400, success: false, message: "Stake payment is already in progress for this request." };
    }

    const stakeAmount = request.biddingPrice * 0.2;

    const options = {
        amount: Math.round(stakeAmount * 100),
        currency: "INR",
        receipt: `stake_${Date.now()}`,
        notes: { "productId": productId.toString(), "buyerId": buyerId.toString(), "type": "seller_stake" },
    };

    try {
        const order = await razorpay.orders.create(options);

        const result = await createStakeOrderDao(productId, buyerId, stakeAmount, order.id);
        if (!result.success) {
            const messages = {
                already_staked: "Request already accepted. Stake already deposited.",
                already_accepted: "Request already accepted. Stake already deposited.",
                stake_pending: "Stake payment is already in progress for this request.",
                already_sold: "Product already sold",
                no_request: "Request not found",
                not_found: "Product not found",
            };
            return { status: 400, success: false, message: messages[result.reason] || "Failed to save stake order details" };
        }

        return { success: true, status: 200, order };
    } catch (error) {
        console.error("Razorpay Error:", error);
        return { success: false, status: 500, message: "Failed to create Razorpay order: " + (error.description || error.message || "Unknown Error") };
    }
};

export const verifyStakeService = async (productId, buyerId, body, razorpay_order_id, razorpay_payment_id, razorpay_signature, secret) => {
    const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);

    if (!isValidSignature) {
        return { success: false, status: 400, message: "Invalid payment signature" };
    }

    const result = await verifyStakeDao(productId, buyerId, razorpay_payment_id);
    if (!result.success) {
        return { success: false, status: 400, message: "Failed to verify stake in database" };
    }

    const acceptResult = await acceptProductRequestDao(productId, buyerId);
    if (!acceptResult.success) {
        return { success: false, status: 400, message: "Stake verified but failed to accept request" };
    }

    // Stake verified + request accepted — product state changed
    await invalidateProductCaches(productId, acceptResult.sellerId);

    await createRequestAcceptedNotification(
        buyerId,
        acceptResult.sellerId,
        productId,
        acceptResult.productName
    );

    return { success: true, status: 200, message: "Stake verified and request accepted successfully" };
};


export const shipOrderService = async (orderId, sellerId, awbCode, courierName, deliveryDetails = {}) => {
    return await shipOrderDao(orderId, sellerId, awbCode, courierName, deliveryDetails);
};

export const verifyDeliveryService = async (orderId, sellerId) => {
    const result = await verifyDeliveryDao(orderId, sellerId);
    if (!result.success) return result;

    const order = result.order;
    console.log(order);
    const { awbCode, productId } = order;

    const hisRequest = productId.requests.find(req => req.buyer.toString() === order.buyerId.toString());
    console.log(hisRequest);
    const expectedPinCode = hisRequest ? hisRequest.shippingAddress.pinCode : null;

    // if (!expectedPinCode) {
    //     return { success: false, status: 400, message: "Buyer shipping address pin code not found" };
    // }

    try {
        const authResponse = await fetch(`${process.env.SHIP_ROCKET_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: process.env.SHIP_ROCKET_EMAIL,
                password: process.env.SHIP_ROCKET_PASSWORD
            })
        });

        if (!authResponse.ok) {
            return { success: false, status: 500, message: "Failed to authenticate with Shiprocket" };
        }

        const authData = await authResponse.json();
        const token = authData.token;

        const trackingResponse = await fetch(`${process.env.SHIP_ROCKET_BASE_URL}/courier/track/awb/${awbCode}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!trackingResponse.ok) {
            return { success: false, status: 400, message: "Failed to track AWB on Shiprocket" };
        }

        const trackingData = await trackingResponse.json();
        console.log(trackingData);
        // ==================== NEED TO UNCOMMENT THIS LATER =========================
        // // As per shiprocket tracking API
        // const trackingDetails = trackingData.tracking_data;
        // const isDelivered = trackingDetails.shipment_track && trackingDetails.shipment_track[0].current_status === 'Delivered';
        // const destinationPincode = trackingDetails.shipment_track && trackingDetails.shipment_track[0].destination_pincode;

        // if (!isDelivered) {
        //     return { success: false, status: 400, message: "Courier has not marked this delivered yet." };
        // }

        // if (destinationPincode && expectedPinCode && destinationPincode.toString() !== expectedPinCode.toString()) {
        //     return { success: false, status: 400, message: "Fraud Alert: Delivery PIN code does not match buyer's PIN code." };
        // }

        await markOrderDeliveredDao(orderId);

        return { success: true, status: 200, message: "Delivery verified successfully. 48-hour window started." };
    } catch (err) {
        console.log("verifyDelivery error: ", err);
        return { success: false, status: 500, message: "Error contacting tracking service." };
    }
};

export const revokeAcceptedRequestService = async (productId) => {
    const result = await revokeAcceptedRequestDao(productId);
    const product = await getProductById(productId);

    await invalidateProductCaches(productId, product.seller._id);


    if (!result.success) {
        const messages = {
            not_found: { status: 404, message: "Product not found" },
            already_sold: { status: 400, message: "Product already sold" },
            no_accepted_request: { status: 400, message: "No accepted request to revoke" },
            payment_in_progress: { status: 400, message: "Cannot revoke accepted request while payment is in progress" }
        };
        return { success: false, ...messages[result.reason] };
    }

    if (result.refundStakeAmount && result.refundStakeAmount > 0) {
        await PendingPayouts.create({
            recipientId: result.sellerId,
            productId: productId,
            amount: result.refundStakeAmount,
            payoutType: "Seller_20_Refund",
            reason: "Seller revoked the accepted request",
        });
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
            no_request: { status: 400, message: "No request from this buyer" },
            already_accepted: { status: 400, message: "Cannot reject a request that is already accepted or has a staked amount. Use revoke instead." }
        };
        return { success: false, ...messages[result.reason] };
    }

    // Request removed from product — invalidate caches
    await invalidateProductCaches(productId, result.sellerId);

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
    const key = KEYS.sellerProducts(id);

    const cached = await cacheGet(key);
    if (cached) {
        return {
            success: true,
            products: cached,
        };
    }

    const fetchedProducts = await findProductsForSeller(id);

    if (fetchedProducts.products) {
        await cacheSet(key, fetchedProducts.products, TTL.SELLER_PRODUCTS);
    }

    return fetchedProducts;
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

export const setupSellerPayoutAccountService = async (sellerId, payload) => {
    try {
        const seller = await getBuyerById(sellerId);
        if (!seller) {
            return { success: false, status: 404, message: "Seller not found" };
        }

        const existingAccount = await getActivePayoutAccountBySellerDao(sellerId);
        if (existingAccount) {
            return {
                success: false,
                status: 409,
                message: "Payout account is already configured for this seller",
            };
        }

        const accountType = payload.accountType;
        const holderName = String(payload.holderName || "").trim();
        const accountNumber = payload.accountNumber ? String(payload.accountNumber).trim() : null;
        const ifsc = payload.ifsc ? String(payload.ifsc).toUpperCase().trim() : null;
        const upiId = payload.upiId ? String(payload.upiId).trim() : null;

        const payoutAccountSource = await createSellerFundAccount({
            seller,
            accountType,
            holderName,
            accountNumber,
            ifsc,
            upiId,
        });

        const payoutAccount = await createPayoutAccountDao({
            sellerId,
            accountType,
            holderName,
            accountNumberMasked: accountType === "bank" ? maskAccountNumber(accountNumber) : null,
            ifsc,
            upiId,
            razorpayContactId: payoutAccountSource.contactId,
            razorpayFundAccountId: payoutAccountSource.fundAccountId,
            verificationStatus: "Verified",
            isActive: true,
        });

        await seller.updateOne({
            $set: {
                defaultPayoutAccountId: payoutAccount._id,
                payoutConfiguredAt: new Date(),
            }
        });

        return {
            success: true,
            status: 201,
            message: "Payout account setup completed",
            payoutAccount: {
                id: payoutAccount._id,
                accountType: payoutAccount.accountType,
                holderName: payoutAccount.holderName,
                accountNumberMasked: payoutAccount.accountNumberMasked,
                ifsc: payoutAccount.ifsc,
                upiId: payoutAccount.upiId,
                verificationStatus: payoutAccount.verificationStatus,
            },
        };
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: error?.error?.description || error.message || "Failed to setup payout account",
        };
    }
};

export const getSellerPayoutAccountService = async (sellerId) => {
    try {
        const account = await getActivePayoutAccountBySellerDao(sellerId);
        if (!account) {
            return {
                success: true,
                status: 200,
                payoutAccount: null,
            };
        }

        return {
            success: true,
            status: 200,
            payoutAccount: {
                id: account._id,
                accountType: account.accountType,
                holderName: account.holderName,
                accountNumberMasked: account.accountNumberMasked,
                ifsc: account.ifsc,
                upiId: account.upiId,
                verificationStatus: account.verificationStatus,
            },
        };
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: error.message || "Failed to fetch payout account",
        };
    }
};

export const withdrawFinalizedBalanceService = async (sellerId, transferMode) => {
    const session = await mongoose.startSession();
    let linkedPayoutIds = [];
    let withdrawal = null;

    try {
        const payoutAccount = await getActivePayoutAccountBySellerDao(sellerId);
        if (!payoutAccount) {
            return {
                success: false,
                status: 400,
                message: "Payout account not configured",
            };
        }

        const existingProcessing = await getProcessingWithdrawalBySellerDao(sellerId);
        if (existingProcessing) {
            return {
                success: false,
                status: 409,
                message: "A withdrawal is already in progress",
            };
        }

        const idempotencyKey = randomUUID();
        let withdrawablePayouts = [];

        await session.withTransaction(async () => {
            withdrawablePayouts = await getWithdrawablePayoutsDao(sellerId, WITHDRAWABLE_PAYOUT_TYPES, session);
            const eligibleAmount = withdrawablePayouts.reduce((sum, payout) => sum + Number(payout.amount || 0), 0);

            if (eligibleAmount <= 0) {
                throw new Error("No finalized balance is available to withdraw");
            }

            withdrawal = await createSellerWithdrawalDao({
                sellerId,
                eligibleAmountSnapshot: roundAmount(eligibleAmount),
                withdrawnAmount: roundAmount(eligibleAmount),
                status: "Processing",
                initiatedAt: new Date(),
                payoutAccountId: payoutAccount._id,
                fundAccountId: payoutAccount.razorpayFundAccountId,
                idempotencyKey,
            }, session);

            linkedPayoutIds = withdrawablePayouts.map((payout) => payout._id);

            await markPayoutsAsLinkedToWithdrawalDao({
                payoutIds: linkedPayoutIds,
                withdrawalId: withdrawal._id,
                idempotencyKey,
            }, session);
        });

        const payoutResponse = await createImmediateSellerPayout({
            fundAccountId: payoutAccount.razorpayFundAccountId,
            amount: withdrawal.withdrawnAmount,
            mode: transferMode || (payoutAccount.accountType === "upi" ? "UPI" : "IMPS"),
            idempotencyKey: withdrawal.idempotencyKey,
            narration: "Seller finalized balance withdrawal",
        });

        await updateSellerWithdrawalDao(withdrawal._id, {
            status: "Processed",
            completedAt: new Date(),
            externalPayoutId: payoutResponse.id,
            failureReason: null,
        });

        await markWithdrawalPayoutExecutionDao({
            payoutIds: linkedPayoutIds,
            payoutId: payoutResponse.id,
            transferMode: payoutResponse.mode || transferMode,
        });

        return {
            success: true,
            status: 200,
            message: "Withdrawal completed successfully",
            data: {
                withdrawalId: withdrawal._id,
                amount: withdrawal.withdrawnAmount,
                externalPayoutId: payoutResponse.id,
                payoutStatus: payoutResponse.status || "processed",
            },
        };
    } catch (error) {
        if (withdrawal?._id) {
            await updateSellerWithdrawalDao(withdrawal._id, {
                status: "Failed",
                failedAt: new Date(),
                failureReason: error?.error?.description || error.message || "Withdrawal failed",
            });
        }

        if (linkedPayoutIds.length > 0) {
            await unlinkPayoutsFromWithdrawalDao(linkedPayoutIds, error?.error?.description || error.message);
            await markWithdrawalPayoutExecutionDao({
                payoutIds: linkedPayoutIds,
                failureCode: error?.error?.code || null,
                failureReason: error?.error?.description || error.message || "Withdrawal failed",
            });
        }

        const message = error.message === "No finalized balance is available to withdraw"
            ? error.message
            : (error?.error?.description || error.message || "Withdrawal failed");

        const isConfigError = message.includes("RazorpayX source account number is missing. Set RAZORPAY_X_ACCOUNT_NUMBER");

        return {
            success: false,
            status: (message === "No finalized balance is available to withdraw" || isConfigError) ? 400 : 500,
            message,
        };
    } finally {
        session.endSession();
    }
};

export const getSellerOrdersService = async (sellerId) => {
    try {
        const orders = await getSellerOrdersDao(sellerId);
        return { success: true, status: 200, orders };
    } catch (error) {
        console.log(error);
        return { success: false, status: 500, message: "Error fetching seller orders" };
    }
};

export const sellerCancelPaidOrderService = async (orderId, sellerId) => {
    const result = await sellerCancelPaidOrderDao(orderId, sellerId);

    if (!result.success) {
        return {
            success: false,
            status: result.status || 400,
            message: result.message || "Failed to cancel order",
        };
    }

    // Order cancelled — product might become available again, invalidate caches
    const productId = result.order?.productId;
    await invalidateProductCaches(productId, sellerId);

    return {
        success: true,
        status: 200,
        message: result.message,
        order: result.order,
    };
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
        let pendingRequest = 0;

        let itemsForSale = 0;

        const baseCategoryMap = {
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
        const categoryRevenueSettled = { ...baseCategoryMap };
        const categoryRevenuePending = { ...baseCategoryMap };

        products.forEach(prod => {
            pendingRequest += prod.requests?.length || 0;

            if (prod.soldTo != null) {
                itemsSold++;
            } else {
                itemsForSale++;
            }
        });

        const sellerPayouts = await PendingPayouts.find({ recipientId: sellerId })
            .populate("productId", "category")
            .sort({ createdAt: -1 });

        const withdrawals = await getSellerWithdrawalsDao(sellerId);

        let settledEarnings = 0;
        let pendingEarnings = 0;
        let failedPayoutAmount = 0;
        let finalizedAvailableBalance = 0;

        sellerPayouts.forEach((payout) => {
            const amount = Number(payout.amount || 0);
            const category = payout.productId?.category;

            if (payout.status === "Processed") {
                settledEarnings += amount;
                if (!payout.withdrawalRequestId && WITHDRAWABLE_PAYOUT_TYPES.includes(payout.payoutType)) {
                    finalizedAvailableBalance += amount;
                }
                if (category && categoryRevenueSettled[category] !== undefined) {
                    categoryRevenueSettled[category] += amount;
                }
                return;
            }

            if (payout.status === "Pending") {
                if (!WITHDRAWABLE_PAYOUT_TYPES.includes(payout.payoutType) || payout.withdrawalRequestId) {
                    pendingEarnings += amount;
                }
                if (category && categoryRevenuePending[category] !== undefined) {
                    categoryRevenuePending[category] += amount;
                }
                return;
            }

            failedPayoutAmount += amount;
        });

        const totalWithdrawnToDate = withdrawals
            .filter((item) => item.status === "Processed")
            .reduce((sum, item) => sum + Number(item.withdrawnAmount || 0), 0);

        const withdrawalsInProcessing = withdrawals
            .filter((item) => item.status === "Initiated" || item.status === "Processing")
            .reduce((sum, item) => sum + Number(item.withdrawnAmount || 0), 0);

        const failedWithdrawalAmount = withdrawals
            .filter((item) => item.status === "Failed")
            .reduce((sum, item) => sum + Number(item.withdrawnAmount || 0), 0);

        const latestWithdrawal = withdrawals[0] || null;

        const sellerOrders = await getSellerOrdersDao(sellerId);
        const disputedHoldAmount = sellerOrders.reduce((sum, order) => {
            if (order.deliveryStatus !== "Disputed") {
                return sum;
            }
            return sum + Number((order.amount || 0) / 100);
        }, 0);

        const legacyRevenueBySale = {
            ...baseCategoryMap,
            ...categoryRevenueSettled,
        };

        return {
            status: 200,
            success: true,
            message: "Analytics found",
            data: {
                earnings: roundAmount(settledEarnings),
                settlementSummary: {
                    settledEarnings: roundAmount(settledEarnings),
                    pendingEarnings: roundAmount(pendingEarnings),
                    failedPayoutAmount: roundAmount(failedPayoutAmount),
                    disputedHoldAmount: roundAmount(disputedHoldAmount),
                    finalizedAvailableBalance: roundAmount(finalizedAvailableBalance),
                    totalWithdrawnToDate: roundAmount(totalWithdrawnToDate),
                    withdrawalsInProcessing: roundAmount(withdrawalsInProcessing),
                    failedWithdrawalAmount: roundAmount(failedWithdrawalAmount),
                    lastWithdrawalAt: latestWithdrawal?.initiatedAt || null,
                    lastWithdrawalStatus: latestWithdrawal?.status || null,
                },
                pendingRequest,
                itemsForSale,
                itemsSold,
                revPerCat: legacyRevenueBySale,
                categoryRevenueSettled,
                categoryRevenuePending,
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
        const receivedPayments = await getPaymentsByTo(userId, 'Users');
        const outgoingPayments = await getPaymentsByFrom(userId, 'Users');
        const withdrawals = await getSellerWithdrawalsDao(userId);

        const sellerPayouts = await PendingPayouts.find({ recipientId: userId })
            .populate("orderId", "deliveryStatus status")
            .populate("productId", "name")
            .sort({ createdAt: -1 });

        const relevantProductIds = Array.from(new Set(
            receivedPayments
                .filter((payment) => payment.relatedEntityType === "Products" && payment.relatedEntityId)
                .map((payment) => String(payment.relatedEntityId?._id || payment.relatedEntityId))
        ));

        const relevantBuyerIds = Array.from(new Set(
            receivedPayments
                .filter((payment) => payment.from)
                .map((payment) => String(payment.from?._id || payment.from))
        ));

        let relatedOrders = [];
        if (relevantProductIds.length > 0 && relevantBuyerIds.length > 0) {
            relatedOrders = await Order.find({
                productId: { $in: relevantProductIds },
                buyerId: { $in: relevantBuyerIds },
            }).select("_id productId buyerId deliveryStatus status timerTriggered48Hour");
        }

        const orderByProductBuyer = new Map();
        relatedOrders.forEach((order) => {
            const key = `${order.productId.toString()}:${order.buyerId.toString()}`;
            orderByProductBuyer.set(key, order);
        });

        const payoutsByOrderId = new Map();
        sellerPayouts.forEach((payout) => {
            const orderId = payout.orderId?._id ? String(payout.orderId._id) : (payout.orderId ? String(payout.orderId) : null);
            if (!orderId) return;
            const bucket = payoutsByOrderId.get(orderId) || [];
            bucket.push(payout);
            payoutsByOrderId.set(orderId, bucket);
        });

        const paymentLedger = receivedPayments.map((payment) => {
            const paymentType = payment.paymentType || "other";
            const productId = payment.relatedEntityId?._id ? String(payment.relatedEntityId._id) : (payment.relatedEntityId ? String(payment.relatedEntityId) : null);
            const buyerId = payment.from?._id ? String(payment.from._id) : (payment.from ? String(payment.from) : null);

            const orderLookupKey = (payment.relatedEntityType === "Products" && productId && buyerId)
                ? `${productId}:${buyerId}`
                : null;
            const order = orderLookupKey ? orderByProductBuyer.get(orderLookupKey) : null;
            const relatedPayouts = order ? (payoutsByOrderId.get(String(order._id)) || []) : [];
            const hasProcessedPayout = relatedPayouts.some((p) => p.status === "Processed");
            const hasPendingPayout = relatedPayouts.some((p) => p.status === "Pending");

            const statusMeta = paymentType === "subscription"
                ? {
                    displayStatus: "Paid",
                    statusClass: "success",
                    isRealizedIncome: false,
                    displayTitle: "Subscription Payment",
                }
                : getPaymentEventStatusMeta(order, hasProcessedPayout, hasPendingPayout);

            const defaultTitle = paymentType === "purchase"
                ? "Buyer Payment Received"
                : paymentType === "subscription"
                    ? "Subscription Payment"
                    : "Payment Event";

            return {
                id: payment._id,
                ledgerType: "payment",
                eventType: paymentType,
                title: statusMeta.displayTitle || defaultTitle,
                date: payment.date,
                amount: Number(payment.price || 0),
                amountSign: "+",
                displayStatus: statusMeta.displayStatus,
                statusClass: statusMeta.statusClass,
                isRealizedIncome: statusMeta.isRealizedIncome,
                counterparty: payment.from?.username || "Buyer",
                orderDeliveryStatus: order?.deliveryStatus || null,
            };
        });

        const expenseLedger = outgoingPayments.map((payment) => ({
            id: payment._id,
            ledgerType: "payment",
            eventType: payment.paymentType || "subscription",
            title: payment.paymentType === "subscription" ? "Platform Subscription" : "Outgoing Payment",
            date: payment.date,
            amount: Number(payment.price || 0),
            amountSign: "-",
            displayStatus: "Paid",
            statusClass: "success",
            isRealizedIncome: false,
            counterparty: payment.to?.username || "Platform",
            orderDeliveryStatus: null,
        }));

        const payoutLedger = sellerPayouts.map((payout) => {
            const statusMeta = getPayoutStatusMeta(payout);
            return {
                id: payout._id,
                ledgerType: "payout",
                eventType: payout.payoutType,
                title: payoutTitleMap[payout.payoutType] || "Seller Payout",
                date: payout.createdAt,
                amount: Number(payout.amount || 0),
                amountSign: "+",
                displayStatus: statusMeta.displayStatus,
                statusClass: statusMeta.statusClass,
                isRealizedIncome: statusMeta.isRealizedIncome,
                counterparty: payout.productId?.name || "Order",
                orderDeliveryStatus: payout.orderId?.deliveryStatus || null,
                reason: payout.reason || null,
            };
        });

        const withdrawalLedger = withdrawals.map((withdrawal) => {
            const isSuccess = withdrawal.status === "Processed";
            const isFailed = withdrawal.status === "Failed";
            const destination = withdrawal.payoutAccountId?.accountType === "upi"
                ? withdrawal.payoutAccountId?.upiId
                : `${withdrawal.payoutAccountId?.accountNumberMasked || "Bank account"}`;

            return {
                id: withdrawal._id,
                ledgerType: "withdrawal",
                eventType: "seller_withdrawal",
                title: "Withdrawal to Payout Account",
                date: withdrawal.initiatedAt,
                amount: Number(withdrawal.withdrawnAmount || 0),
                amountSign: "-",
                displayStatus: isSuccess ? "Transferred" : (isFailed ? "Transfer Failed" : "Transfer Processing"),
                statusClass: isSuccess ? "success" : (isFailed ? "failed" : "pending"),
                isRealizedIncome: false,
                counterparty: destination,
                orderDeliveryStatus: null,
                reason: withdrawal.failureReason || null,
            };
        });

        const settledEarnings = payoutLedger
            .filter((item) => WITHDRAWABLE_PAYOUT_TYPES.includes(item.eventType) && item.statusClass === "success")
            .reduce((sum, item) => sum + item.amount, 0);

        const pendingEarnings = payoutLedger
            .filter((item) => WITHDRAWABLE_PAYOUT_TYPES.includes(item.eventType) && item.statusClass === "pending")
            .reduce((sum, item) => sum + item.amount, 0);

        const availableToWithdraw = sellerPayouts
            .filter((payout) => ["Pending", "Processed"].includes(payout.status) && !payout.withdrawalRequestId && WITHDRAWABLE_PAYOUT_TYPES.includes(payout.payoutType))
            .reduce((sum, payout) => sum + Number(payout.amount || 0), 0);

        const withdrawnToDate = withdrawals
            .filter((item) => item.status === "Processed")
            .reduce((sum, item) => sum + Number(item.withdrawnAmount || 0), 0);

        const inProgressWithdrawals = withdrawals
            .filter((item) => item.status === "Initiated" || item.status === "Processing")
            .reduce((sum, item) => sum + Number(item.withdrawnAmount || 0), 0);

        const failedWithdrawals = withdrawals
            .filter((item) => item.status === "Failed")
            .reduce((sum, item) => sum + Number(item.withdrawnAmount || 0), 0);

        const grossBuyerPayments = paymentLedger
            .filter((item) => item.amountSign === "+")
            .reduce((sum, item) => sum + item.amount, 0);

        return {
            success: true,
            status: 200,
            paymentLedger: [...paymentLedger, ...expenseLedger].sort((a, b) => new Date(b.date) - new Date(a.date)),
            payoutLedger,
            withdrawalLedger,
            summary: {
                grossBuyerPayments: roundAmount(grossBuyerPayments),
                settledEarnings: roundAmount(settledEarnings),
                pendingEarnings: roundAmount(pendingEarnings),
                availableToWithdraw: roundAmount(availableToWithdraw),
                withdrawnToDate: roundAmount(withdrawnToDate),
                inProgressWithdrawals: roundAmount(inProgressWithdrawals),
                failedWithdrawals: roundAmount(failedWithdrawals),
            },
            received: receivedPayments,
            paidTo: outgoingPayments,
        }
    } catch (error) {
        console.log(error);
        return {
            success: false,
            status: 500,
            message: "Internal server err",
            paymentLedger: [],
            payoutLedger: [],
            withdrawalLedger: [],
            summary: {
                grossBuyerPayments: 0,
                settledEarnings: 0,
                pendingEarnings: 0,
                availableToWithdraw: 0,
                withdrawnToDate: 0,
                inProgressWithdrawals: 0,
                failedWithdrawals: 0,
            },
        }
    }

}
