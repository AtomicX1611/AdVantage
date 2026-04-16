import {
    getFeaturedFreshProductsService,
    getProductDetailsService,
    getProductsService,
} from "../services/anyone.service.js";

export const getFeaturedFreshProducts = async (req, res, next) => {
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
        next(error);
    }
}

export const getProductDetails = async (req,res,next) => {
    try {
        // console.log("At first coming");
        const { productId } = req.params;
        if(!productId){
            return res.status(400).json("Need product Id");
        }
        const response = await getProductDetailsService(productId);

        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message
            });
        }
        // console.log(response.product);
        return res.status(200).json({
            success: true,
            product: response.product,
            message: response.message,
        });
    } catch (error) {
        next(error);
    }
}

export const getProducts = async (req,res,next) => {
    try{
        const products = await getProductsService(req.query);
        // console.log(" sdkjf ");
        console.log(products);
        return res.status(200).json({
            success: true,
            products,
            message: "Products retrieved successfully",
        });
    }catch(error){
        // console.log("dkssddd");
        next(error);
    }
}