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
import { getOrderByProductAndBuyerDao } from "../daos/orders.dao.js";
import PendingPayouts from "../models/PendingPayouts.js";

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

export const resolveEscrowComplaintService = async (complaintId, managerId, managerCategory, decision, resolution) => {
    try {
        const complaint = await getComplaintByIdDao(complaintId);
        if (!complaint) {
            return { success: false, status: 404, message: "Complaint not found" };
        }

        if (!complaint.productId || complaint.productId.category !== managerCategory) {
            return { success: false, status: 403, message: "You can only resolve complaints in your assigned category" };
        }

        const order = await getOrderByProductAndBuyerDao(complaint.productId._id, complaint.complainant);
        if (!order) {
            return { success: false, status: 404, message: "Associated order not found" };
        }

        let stakeAmount = 0;
        if (order.productId && order.productId.requests) {
            const req = order.productId.requests.find(r => r.buyer.toString() === order.buyerId.toString());
            if (req && req.sellerStakeStatus === 'Locked') {
                stakeAmount = req.sellerStakeAmount;
                req.sellerStakeStatus = 'Refunded'; // Mark as refunded whether it goes to seller or we slash/refund
                await order.productId.save();
            }
        }

        if (decision === "Buyer_Win") {
            // Buyer gets 100% back
            await PendingPayouts.create({
                recipientId: order.buyerId,
                productId: order.productId._id,
                amount: order.amount,
                payoutType: "Buyer_100_Refund",
                reason: `Manager resolved dispute in favor of buyer. Resolution: ${resolution}`,
            });

            // Seller gets 20% stake back (or it could be slashed, but based on requirements, we just refund)
            if (stakeAmount > 0) {
                await PendingPayouts.create({
                    recipientId: order.productId.seller,
                    productId: order.productId._id,
                    amount: stakeAmount,
                    payoutType: "Seller_20_Refund",
                    reason: `Dispute resolved in favor of buyer, stake refunded.`,
                });
            }
        } else if (decision === "Seller_Win") {
            // Seller gets 100% price + 20% stake
            const payoutAmount = order.amount + stakeAmount;
            await PendingPayouts.create({
                recipientId: order.productId.seller,
                productId: order.productId._id,
                amount: payoutAmount,
                payoutType: "Seller_120_Percent",
                reason: `Manager resolved dispute in favor of seller. Resolution: ${resolution}`,
            });
        } else {
            return { success: false, status: 400, message: "Invalid decision. Use 'Buyer_Win' or 'Seller_Win'." };
        }

        order.deliveryStatus = "Completed";
        await order.save();

        const updated = await resolveComplaintDao(complaintId, managerId, "resolved", resolution);
        return {
            success: true,
            status: 200,
            message: "Escrow complaint resolved and payouts queued successfully",
            complaint: updated,
        };
    } catch (error) {
        console.error("Error in resolveEscrowComplaintService:", error);
        return { success: false, message: "Error resolving escrow complaint" };
    }
};