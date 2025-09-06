import {
    addProductService,
    acceptProductRequestService,
    rejectProductRequestService,
    updateSellerProfileService,
    updateSellerPasswordService,
    updateSellerSubscriptionService,
} from "../services/seller.service.js";

export const addProduct = async (req, res) => {
    try {
        const newProduct = await addProductService(req);
        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            data: newProduct,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

export const updateSellerProfile = async (req, res) => {
    try {
        console.log(req.user);
        const sellerId = req.user._id;
        const updateData = req.body;

        if (!sellerId) {
            return res.status(400).json({
                success: false,
                message: "Seller ID is missing",
            });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No update fields provided",
            });
        }

        const response = await updateSellerProfileService(sellerId, updateData, req.file);

        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            updatedSeller: response.updatedSeller,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const updateSellerSubscription = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { subscription } = req.body;
        if(subscription<1){
            return res.status(400).json({
                success: false,
                message: "Subscription cannot be less that 1",
            });
        }
        const response = await updateSellerSubscriptionService(sellerId,subscription);

        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message,
            });
        }

        return res.status(200).json({
            success: true,
            updatedSeller: response.updatedSeller,
            message: "Subscription updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}

export const acceptRequest = async (req, res) => {
    try {
        const { productId, buyerId } = req.params;

        const response = await acceptProductRequestService(productId, buyerId);

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

export const rejectRequest = async (req, res) => {
    try {
        const { productId, buyerId } = req.params;

        const response = await rejectProductRequestService(productId, buyerId);

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
            message: error.message || "Internal server error",
        });
    }
};

export const updateSellerPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Both oldPassword and newPassword are required",
            });
        }

        const response = await updateSellerPasswordService(oldPassword, newPassword, userId);

        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal server error"
        });
    }
};