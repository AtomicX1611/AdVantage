import { 
    verifyProductDao,
    findUnverifiedProducts,
    findUnverifiedProductsByCategory,
    getProductById,
 } from "../daos/products.dao.js"
import { createProductVerifiedNotification } from "../helpers/notification.helper.js";
import {
    getComplaintsByCategoryDao,
    resolveComplaintDao,
    getComplaintByIdDao,
} from "../daos/complaints.dao.js";
import { getOrderByIdMongoDao, getOrderByProductAndBuyerDao } from "../daos/orders.dao.js";
import PendingPayouts from "../models/PendingPayouts.js";
import { invalidateProductCaches, invalidateAdminCaches } from "../config/cache.config.js";

const roundAmount = (value) => Number(value.toFixed(2));

const getStakeFromProductRequest = (order) => {
    if (!order?.productId?.requests) {
        return { request: null, stakeAmount: 0 };
    }

    const request = order.productId.requests.find(
        (req) => req.buyer.toString() === order.buyerId.toString()
    );

    return {
        request,
        stakeAmount: Number(request?.sellerStakeAmount || 0),
    };
};

const getBuyerRefundAmount = (actionType, buyerPaidAmount, buyerRefundAmount, buyerRefundPercent) => {
    if (actionType === "reject_dispute") {
        return 0;
    }

    if (actionType === "refund_buyer") {
        return buyerPaidAmount;
    }

    if (actionType !== "custom_split") {
        return null;
    }

    if (buyerRefundAmount !== undefined && buyerRefundAmount !== null && buyerRefundAmount !== "") {
        const parsedAmount = Number(buyerRefundAmount);
        if (!Number.isFinite(parsedAmount)) {
            return null;
        }
        return roundAmount(parsedAmount);
    }

    if (buyerRefundPercent !== undefined && buyerRefundPercent !== null && buyerRefundPercent !== "") {
        const parsedPercent = Number(buyerRefundPercent);
        if (!Number.isFinite(parsedPercent)) {
            return null;
        }
        return roundAmount((buyerPaidAmount * parsedPercent) / 100);
    }

    return null;
};

export const verifyProduct = async (productId, managerId, managerCategory) => {
    // First check the product belongs to manager's category
    const product = await getProductById(productId);
    if (!product) {
        return { success: false, status: 404, message: "Product not found" };
    }
    if (product.category !== managerCategory) {
        return { 
            success: false, 
            status: 403, 
            message: "You can only verify products in your assigned category: " + managerCategory 
        };
    }

    let response = await verifyProductDao(productId);

    // Product is now verified — it may now appear on homepage / detail pages
    await invalidateProductCaches(productId, product.seller._id || product.seller);
    await invalidateAdminCaches();

    await createProductVerifiedNotification(
        response.sellerId,
        managerId,
        productId,
        response.productName,
    );
    return response;
}

export const fetchUnverifiedProducts = async() => {
    return await findUnverifiedProducts();
}

export const fetchUnverifiedProductsByCategory = async (category) => {
    return await findUnverifiedProductsByCategory(category);
}

export const fetchComplaintsByCategory = async (category) => {
    try {
        const complaints = await getComplaintsByCategoryDao(category);
        return {
            success: true,
            complaints,
        };
    } catch (error) {
        console.error("Error in fetchComplaintsByCategory:", error);
        return { success: false, message: "Error fetching complaints" };
    }
};

export const resolveComplaintService = async (complaintId, managerId, managerCategory, status, resolution) => {
    try {
        const complaint = await getComplaintByIdDao(complaintId);
        if (!complaint) {
            return { success: false, status: 404, message: "Complaint not found" };
        }

        // Verify the complaint's product belongs to this manager's category
        if (!complaint.productId || complaint.productId.category !== managerCategory) {
            return { 
                success: false, 
                status: 403, 
                message: "You can only resolve complaints in your assigned category" 
            };
        }

        const updated = await resolveComplaintDao(complaintId, managerId, status, resolution);
        return {
            success: true,
            message: "Complaint updated successfully",
            complaint: updated,
        };
    } catch (error) {
        console.error("Error in resolveComplaintService:", error);
        return { success: false, message: "Error resolving complaint" };
    }
};

export const resolveEscrowComplaintService = async (complaintId, managerId, managerCategory, payload) => {
    let complaint;
    try {
        complaint = await getComplaintByIdDao(complaintId);
        if (!complaint) {
            return { success: false, status: 404, message: "Complaint not found" };
        }

        if (!complaint.productId || complaint.productId.category !== managerCategory) {
            return { success: false, status: 403, message: "You can only resolve complaints in your assigned category" };
        }

        let order = null;
        if (complaint.orderId) {
            const orderLookup = await getOrderByIdMongoDao(complaint.orderId._id || complaint.orderId);
            if (orderLookup.success) {
                order = orderLookup.order;
            }
        }

        if (!order) {
            order = await getOrderByProductAndBuyerDao(complaint.productId._id, complaint.complainant);
        }

        if (!order) {
            return { success: false, status: 404, message: "Associated order not found" };
        }

        if (order.deliveryStatus !== "Disputed") {
            return { success: false, status: 400, message: "Only disputed orders can be settled by manager" };
        }

        const {
            actionType,
            resolution,
            buyerRefundAmount,
            buyerRefundPercent,
            sellerStakeReleaseAmount,
        } = payload;

        if (!["reject_dispute", "refund_buyer", "custom_split"].includes(actionType)) {
            return {
                success: false,
                status: 400,
                message: "Invalid actionType. Use 'reject_dispute', 'refund_buyer', or 'custom_split'.",
            };
        }

        const buyerPaidAmount = roundAmount(order.amount / 100);
        const computedBuyerRefund = getBuyerRefundAmount(
            actionType,
            buyerPaidAmount,
            buyerRefundAmount,
            buyerRefundPercent
        );

        if (computedBuyerRefund === null || computedBuyerRefund < 0 || computedBuyerRefund > buyerPaidAmount) {
            return {
                success: false,
                status: 400,
                message: "Invalid buyer refund. It must be between 0 and total buyer-paid amount.",
            };
        }

        const sellerBuyerPoolAmount = roundAmount(buyerPaidAmount - computedBuyerRefund);

        const { request, stakeAmount } = getStakeFromProductRequest(order);
        const totalStake = roundAmount(stakeAmount);
        const parsedStakeRelease = Number(sellerStakeReleaseAmount ?? 0);
        const normalizedStakeRelease = Number.isFinite(parsedStakeRelease) ? roundAmount(parsedStakeRelease) : NaN;

        if (!Number.isFinite(normalizedStakeRelease) || normalizedStakeRelease < 0 || normalizedStakeRelease > totalStake) {
            return {
                success: false,
                status: 400,
                message: `Invalid seller stake release amount. It must be between 0 and ${totalStake}.`,
            };
        }

        const sellerStakeHeldAmount = roundAmount(totalStake - normalizedStakeRelease);

        if (computedBuyerRefund > 0) {
            await PendingPayouts.create({
                recipientId: order.buyerId,
                orderId: order._id,
                productId: order.productId._id,
                amount: computedBuyerRefund,
                payoutType: computedBuyerRefund === buyerPaidAmount ? "Buyer_100_Refund" : "Buyer_Partial_Refund",
                reason: `Manager settlement (${actionType}) for dispute. Resolution: ${resolution || ""}`,
            });
        }

        if (sellerBuyerPoolAmount > 0) {
            await PendingPayouts.create({
                recipientId: order.productId.seller,
                orderId: order._id,
                productId: order.productId._id,
                amount: sellerBuyerPoolAmount,
                payoutType: "Seller_BuyerPool_Share",
                reason: `Manager settlement (${actionType}) seller share from buyer-paid pool. Resolution: ${resolution || ""}`,
            });
        }

        if (normalizedStakeRelease > 0) {
            await PendingPayouts.create({
                recipientId: order.productId.seller,
                orderId: order._id,
                productId: order.productId._id,
                amount: normalizedStakeRelease,
                payoutType: "Seller_Stake_Release",
                reason: `Manager settlement (${actionType}) released seller stake amount. Resolution: ${resolution || ""}`,
            });
        }

        if (request) {
            request.sellerStakeStatus = sellerStakeHeldAmount > 0 ? "Slashed" : "Refunded";
            await order.productId.save();
        }

        order.deliveryStatus = "Completed";
        order.timerTriggered48Hour = true;
        await order.save();

        const updated = await resolveComplaintDao(
            complaintId,
            managerId,
            "resolved",
            resolution,
            {
                settlement: {
                    decisionType: actionType,
                    buyerRefundAmount: computedBuyerRefund,
                    sellerBuyerPoolAmount,
                    sellerStakeReleaseAmount: normalizedStakeRelease,
                    sellerStakeHeldAmount,
                },
            }
        );

        return {
            success: true,
            status: 200,
            message: "Escrow complaint resolved and payouts queued successfully",
            complaint: updated,
        };
    } catch (error) {
        console.error("Error in resolveEscrowComplaintService:", error);
        return { success: false, message: "Error resolving escrow complaint" };
    } finally {
        // Product stake status or order status changed — always invalidate
        if (complaint?.productId) {
            const prod = complaint.productId;
            await invalidateProductCaches(prod._id || prod, prod.seller);
        }
    }
};