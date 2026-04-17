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