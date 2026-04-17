import {
    updateBuyerById,
    addToWishlistDao,
    removeFromWishlistDao,
    getBuyerById,
    updateBuyerPassById,
    getWishlistProductsDao,
} from "../daos/users.dao.js";
import {
    razorpay
} from "../config/payment.config.js";
import {
    addProductRequestDao,
    getYourProductsDao,
    rentDao,
    holdPoductWhilePaymentDao,
    releaseProductPaymentHoldDao,
    notInterestedDao,
    getProductsSellerAccepted,
} from "../daos/products.dao.js";
import {
    createOrderDao,
    getOrderByIdDao,
    updateOrderStatusDao,
    disputeOrderDao,
} from "../daos/orders.dao.js";
import { paymentDoneHelper,updateSellerSubscriptionHelper } from "../helpers/user.helper.js";
import { createNewRequestNotification } from "../helpers/notification.helper.js";
import {
    getUserNotificationsHelper,
    markNotificationAsReadHelper,
    markAllUserNotificationsAsReadHelper,
    deleteUserNotificationHelper,
} from "../helpers/notification.helper.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import mongoose from "mongoose";
import PendingPayouts from "../models/PendingPayouts.js";
import Complaints from "../models/Complaints.js";

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
        filteredData.profilePicPath = file;
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

export const getYourNotificationsService = async (userId) => {
    const result = await getUserNotificationsHelper(userId, { includeRead: true, limit: 50, skip: 0 });

    return {
        success: true,
        notifications: result.notifications,
        unreadCount: result.unreadCount,
    };
}

export const markNotificationAsReadService = async (userId, notificationId) => {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return {
            success: false,
            status: 400,
            message: "Invalid notification id",
        };
    }

    return await markNotificationAsReadHelper(userId, notificationId);
};

export const markAllNotificationsAsReadService = async (userId) => {
    return await markAllUserNotificationsAsReadHelper(userId);
};

export const deleteNotificationService = async (userId, notificationId) => {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return {
            success: false,
            status: 400,
            message: "Invalid notification id",
        };
    }

    return await deleteUserNotificationHelper(userId, notificationId);
};

export const getPendingRequestsService = async (buyerId) => {
    const pendingRequests = await getProductsSellerAccepted(buyerId);
    if (!pendingRequests) {
        return {
            success: false,
            status: 404,
            message: "No pending requests found",
        };
    }
    return {
        status: 200,
        success: true,
        message: "Pending requests fetched successfully",
        products: pendingRequests,
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

export const requestProductService = async (productId, buyerId, biddingPrice, shippingAddress) => {
    const result = await addProductRequestDao(productId, buyerId, biddingPrice, shippingAddress);
    console.log("result in req prod serv", result);
    if (!result.success) {
        const messages = {
            not_found: { status: 404, message: "Product not found" },
            self_request: { status: 400, message: "You cannot request your own product" },
            already_sold: { status: 400, message: "Product is already sold" },
            already_requested: { status: 400, message: "You have already requested this product" }
        };
        return { success: false, ...messages[result.reason] };
    }
    await createNewRequestNotification(
        result.sellerId,
        buyerId,
        productId,
        result.productName,
        biddingPrice
    );
    return { success: true, message: "Request sent successfully" };
};

export const createOrderService = async (buyerId, productId, subscription) => {
    if(subscription!== false){
        const subscriptionPrices = {
            1: 100,
            2: 500
        };

        if (!subscriptionPrices[subscription]) {
            return {
                success: false,
                status: 400,
                message: "Invalid subscription selected",
            };
        }

        const seller = await getBuyerById(buyerId);

        if (!seller) {
            return {
                success: false,
                message: "Seller not found",
                status: 404
            };
        }

        if (seller.subscription >= subscription) {
            return {
                success: false,
                message: "Seller already has a better or equal plan than the chosen one",
                status: 404
            };
        }

        // Determine subscription price
        const options = {
            amount: subscriptionPrices[subscription] * 100, // Convert amount to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: { "subscription": subscription.toString(), "sellerId": buyerId.toString() },
        };
        const order = await razorpay.orders.create(options);
        const result = await createOrderDao(buyerId, null, subscription, order.id, order.amount, order.currency, order.receipt, order.notes);
        return {
            success: true,
            message: "Subscription Order created successfully",
            order: result.order
        };
    }
    const holdProductResponse = await holdPoductWhilePaymentDao(buyerId, productId);
    if (!holdProductResponse.success) {
        const messages = {
            not_found: { status: 404, message: "Product not found" },
            not_accepted_buyer: { status: 400, message: "You are not the accepted buyer for this product" },
            already_sold: { status: 400, message: "Product is already sold" },
            payment_in_progress: { status: 400, message: "Payment is already in progress for this product" },
        };
        return { success: false, ...messages[holdProductResponse.reason] };
    }
    const options = {
        amount: holdProductResponse.price * 100, // Convert amount to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: { "productId": productId.toString(), "buyerId": buyerId.toString() },
    };

    const order = await razorpay.orders.create(options);
    order.buyerId = buyerId;
    order.productId = productId;
    const result = await createOrderDao(buyerId, productId, null, order.id, order.amount, order.currency, order.receipt,order.notes);

    return { success: true, message: "Order created successfully", order: result.order };
};

export const verifyPaymentService = async (body, razorpay_order_id, razorpay_payment_id, razorpay_signature, secret) => {
    const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);

    const existingOrder = await getOrderByIdDao(razorpay_order_id);
    if (!existingOrder.success) {
        return { success: false, status: 404, message: "Order not found" };
    }

    const currentOrder = existingOrder.order;
    if (currentOrder.status === "paid" && currentOrder.paymentProcessed) {
        return {
            success: true,
            status: 200,
            message: "Payment already verified",
        };
    }

    if (!isValidSignature) {
        await updateOrderStatusDao(razorpay_order_id, "failed");

        if (currentOrder.productId) {
            await releaseProductPaymentHoldDao(currentOrder.productId, currentOrder.buyerId);
        }

        return { success: false, status: 400, message: "Invalid payment signature" };
    }

    const result = await updateOrderStatusDao(razorpay_order_id, "paid", {
        paymentId: razorpay_payment_id,
    });

    if (!result.success) {
        return { success: false, status: 404, message: "Order not found" };
    }

    return {
        success: true,
        status: 200,
        message: "Payment verified successfully",
    };
}

export const paymentDoneService = async (buyerId, productId, razorpay_payment_id) => {
    if (!razorpay_payment_id) {
        return {
            success: false,
            status: 400,
            message: "razorpay_payment_id is required",
        };
    }

    return await paymentDoneHelper(buyerId, productId, razorpay_payment_id);
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

    if (result.refundStakeAmount && result.refundStakeAmount > 0) {
        await PendingPayouts.create({
            recipientId: result.sellerId,
            productId: productId,
            amount: result.refundStakeAmount,
            payoutType: "Seller_20_Refund",
            reason: "Buyer marked as not interested after acceptance",
        });
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

export const rentService = async (buyerId, productId, from, to, biddingPrice) => {
    return await rentDao(buyerId, productId, from, to, biddingPrice);
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

export const disputeOrderService = async (orderId, buyerId, subject, description) => {
    const result = await disputeOrderDao(orderId, buyerId);
    if (!result.success) {
        return { success: false, status: 400, message: result.message };
    }

    const complaint = new Complaints({
        productId: result.order.productId._id || result.order.productId,
        complainant: buyerId,
        respondent: result.order.productId.seller,
        type: "product",
        subject: subject,
        description: description,
        status: "pending"
    });

    await complaint.save();

    return { success: true, status: 200, message: "Dispute created successfully" };
};