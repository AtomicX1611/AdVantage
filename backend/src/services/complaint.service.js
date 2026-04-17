import {
    createComplaintDao,
    getComplaintsByUserDao,
    getComplaintsForProductDao,
    getBuyersForProductDao,
} from "../daos/complaints.dao.js";
import { getProductById } from "../daos/products.dao.js";
import { findManagerByCategory } from "../daos/managers.dao.js";

export const fileComplaintService = async (complainantId, productId, respondentId, type, subject, description) => {
    try {
        // Validate product exists
        const product = await getProductById(productId);
        if (!product) {
            return { success: false, status: 404, message: "Product not found" };
        }

        // Prevent filing complaint on yourself
        if (respondentId && respondentId.toString() === complainantId.toString()) {
            return { success: false, status: 400, message: "You cannot file a complaint against yourself" };
        }

        // Auto-assign manager based on product category
        const manager = await findManagerByCategory(product.category);

        const complaintData = {
            productId,
            complainant: complainantId,
            respondent: respondentId || null,
            type,
            subject,
            description,
            assignedManager: manager ? manager._id : null,
        };

        const complaint = await createComplaintDao(complaintData);

        return {
            success: true,
            message: "Complaint filed successfully",
            complaint,
        };
    } catch (error) {
        console.error("Error in fileComplaintService:", error);
        return { success: false, status: 500, message: "Error filing complaint" };
    }
};

export const getMyComplaintsService = async (userId) => {
    try {
        const complaints = await getComplaintsByUserDao(userId);
        return {
            success: true,
            complaints,
        };
    } catch (error) {
        console.error("Error in getMyComplaintsService:", error);
        return { success: false, status: 500, message: "Error fetching complaints" };
    }
};

export const getProductComplaintsService = async (productId) => {
    try {
        const complaints = await getComplaintsForProductDao(productId);
        return {
            success: true,
            complaints,
        };
    } catch (error) {
        console.error("Error in getProductComplaintsService:", error);
        return { success: false, status: 500, message: "Error fetching complaints" };
    }
};

export const getProductBuyersService = async (productId) => {
    try {
        const buyers = await getBuyersForProductDao(productId);
        return {
            success: true,
            buyers,
        };
    } catch (error) {
        console.error("Error in getProductBuyersService:", error);
        return { success: false, status: 500, message: "Error fetching buyers" };
    }
};
