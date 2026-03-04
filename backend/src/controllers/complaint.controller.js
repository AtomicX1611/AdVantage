import {
    fileComplaintService,
    getMyComplaintsService,
    getProductComplaintsService,
    getProductBuyersService,
} from "../services/complaint.service.js";

export const fileComplaint = async (req, res, next) => {
    try {
        const complainantId = req.user._id;
        const { productId, respondentId, type, subject, description } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
        }

        if (!type || !subject || !description) {
            return res.status(400).json({
                success: false,
                message: "Type, subject, and description are required",
            });
        }

        const result = await fileComplaintService(
            complainantId,
            productId,
            respondentId || null,
            type,
            subject,
            description
        );

        return res.status(result.success ? 201 : (result.status || 400)).json(result);
    } catch (error) {
        console.error("Error in fileComplaint controller:", error);
        next(error);
    }
};

export const getMyComplaints = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const result = await getMyComplaintsService(userId);
        return res.status(result.success ? 200 : (result.status || 500)).json(result);
    } catch (error) {
        next(error);
    }
};

export const getProductComplaints = async (req, res, next) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
        }
        const result = await getProductComplaintsService(productId);
        return res.status(result.success ? 200 : (result.status || 500)).json(result);
    } catch (error) {
        next(error);
    }
};

export const getProductBuyers = async (req, res, next) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
        }
        const result = await getProductBuyersService(productId);
        return res.status(result.success ? 200 : (result.status || 500)).json(result);
    } catch (error) {
        next(error);
    }
};
