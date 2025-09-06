import {
    getFeaturedFreshProductsService,
} from "../services/anyone.service.js";

export const getFeaturedFreshProducts = async (req, res) => {
    try {
        const response = await getFeaturedFreshProductsService();

        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message
            });
        }
        return res.status(200).json({
            success: true,
            freshProducts: response.freshProducts,
            featuredProducts: response.featuredProducts,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
}