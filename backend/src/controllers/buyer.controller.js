import {
    updateBuyerProfileService,
    addToWishlistService,
    removeFromWishlistService,
    requestProductService,
    updateBuyerPasswordService,
} from "../services/buyer.service.js";

export const updateBuyerProfile = async (req, res) => {
    try {
        const buyerId = req.user._id; // assuming you set buyerId in middleware from JWT
        const updateData = req.body;

        if (!buyerId) {
            return res.status(400).json({
                success: false,
                message: "Buyer ID is missing",
            });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No update fields provided",
            });
        }

        const response = await updateBuyerProfileService(buyerId, updateData, req.file);

        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            updatedBuyer: response.updatedBuyer,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const productId = req.params.productId;

        const response = await addToWishlistService(userId, productId);

        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message
            });
        }

        return res.status(200).json({
            success: true,
            message: response.message
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const productId = req.params.productId;

        const response = await removeFromWishlistService(userId, productId);

        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message
            });
        }

        return res.status(200).json({
            success: true,
            message: response.message
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const requestProduct = async (req, res) => {
    try {
        const buyerId = req.user._id;
        const productId = req.params.productId;

        const response = await requestProductService(productId, buyerId);

        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message
            });
        }

        return res.status(200).json({
            success: true,
            message: response.message
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const updateBuyerPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user._id;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Both oldPassword and newPassword are required",
            });
        }
        const response = await updateBuyerPasswordService(oldPassword, newPassword, userId);
        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message,
            });
        }
        return res.status(200).json({
            success: true,
            message: "password updated successfully",
        });
    }catch(error){
        return res.status(500).json({
            message: error
        });
    }
}