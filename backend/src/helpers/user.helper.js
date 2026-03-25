import { createPayment } from "../daos/payment.dao.js";
import { paymentDoneDao } from "../daos/products.dao.js";
import { createProductSoldNotification } from "../helpers/notification.helper.js";
import { getBuyerById } from "../daos/users.dao.js";
import { getAllAdmins } from "../daos/admins.dao.js";

export const paymentDoneHelper = async (buyerId, productId, razorpay_payment_id) => {
    const result = await paymentDoneDao(buyerId, productId);
    if (!result.success) {
        const messages = {
            not_found: { status: 404, message: "Product not found" },
            not_accepted_buyer: { status: 400, message: "You are not the accepted buyer for this product" },
            already_sold: { status: 400, message: "Product is already sold" },
            payment_not_in_progress: { status: 400, message: "Payment was not initialized for this product" },
        };
        return { success: false, ...messages[result.reason] };
    }

    //here create payment record
    const paymentData = {
        from: buyerId,
        fromModel: 'Users',
        to: result.sellerId,
        toModel: 'Users',
        paymentType: "purchase",
        relatedEntityId: productId,
        relatedEntityType: "Products",
        price: result.price,
        razorpay_payment_id: razorpay_payment_id,
    };

    const payment = await createPayment(paymentData);
    await createProductSoldNotification(
        result.sellerId,
        buyerId,
        productId,
        result.productName,
        result.price
    );
    return { success: true, message: "Payment confirmed successfully", payment: payment };
};

export const updateSellerSubscriptionHelper = async (sellerId, subscription, razorpay_payment_id) => {
    try {
        const seller = await getBuyerById(sellerId);

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
        const subscriptionPrices = {
            1: 100,  // Basic subscription
            2: 500   // Premium subscription
        };

        const price = subscriptionPrices[subscription] || 0;

        if (price === 0) {
            return {
                success: false,
                message: "Invalid subscription level",
            };
        }

        // Update seller subscription
        seller.subscription = subscription;
        await seller.save();

        const admins = await getAllAdmins();
        const primaryAdmin = admins?.[0] || null;

        if (primaryAdmin?._id) {
            // Record the subscription payment only when an admin receiver exists.
            await createPayment({
                from: sellerId,
                fromModel: 'Users',
                to: primaryAdmin._id,
                toModel: 'Admin',
                paymentType: 'subscription',
                price: price,
                relatedEntityId: null,
                relatedEntityType: null,
                razorpay_payment_id: razorpay_payment_id,
            });
        } else {
            console.warn("No admin found while recording subscription payment. Subscription updated without payment ledger entry.");
        }

        return {
            success: true,
            message: "Subscription updated successfully",
            updatedSeller: seller,
        };

    } catch (error) {
        console.error("Error in updateSellerSubscriptionService:", error);
        return {
            status: 500,
            success: false,
            message: "Internal server error while updating subscription",
        };
    }
};