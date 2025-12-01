import {
    updateBuyerProfileService,
    addToWishlistService,
    removeFromWishlistService,
    requestProductService,
    updateBuyerPasswordService,
    getWishlistProductsService,
    getYourProductsService,
    rentService,
    getYouProfileService,
} from "../services/buyer.service.js";

export const updateBuyerProfile = async (req, res) => {
    try {
        const buyerId = req.user._id;
        const updateData = req.body;

        if (!buyerId) {
            return res.status(400).json({
                success: false,
                message: "Buyer ID is missing",
            });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            if (req.file === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "No update fields provided",
                });
            }
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
    console.log("gettiasdadang wishlist in backend"); 
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

export const getWishlistProducts = async (req, res) => {
    try {
        // console.log("fdskjf");
        const userId = req.user._id;
        const response = await getWishlistProductsService(userId);
        // console.log(response);
        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message
            });
        }
        return res.status(200).json({
            success: true,
            message: response.message,
            products: response.products,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
}

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
        // console.log("coming to buyerPassword");
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
    } catch (error) {
        return res.status(500).json({
            message: error
        });
    }
}

export const getYourProducts = async (req, res) => {
    try {
        const userId = req.user._id;
        const response = await getYourProductsService(userId);
        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message
            });
        }
        return res.status(200).json({
            success: true,
            products: response.products,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
}

export const rentProductController = async (req, res) => {
    const buyerId = req.user._id;
    const productId = req.params.productId;
    const { from, to } = req.body;

    if (!buyerId || !productId || !from || !to) {
        return res.status(404).json({ message: "Missing buyerId or productId or from or to" });
    }

    let respose = await rentService(buyerId, productId, from, to);

    return res.status(respose.status).json({ success: respose.success, message: respose.message });
}

export const getYourProfile = async (req, res) => {
    try {
        const buyerId = req.user._id;
        const response = await getYouProfileService(buyerId);
        return res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
}