import { 
    verifyProduct,
    fetchUnverifiedProducts
 } from "../services/manager.service.js";

export const verifyController = async (req,res) => {
    const productId=req.body.pid;
    if(!productId) return res.status(400).json({
        success:false,
        message:"Product Id not found"
    });

    try {
        const verify=await verifyProduct(productId);
        if(!verify.success) {
            return res.status(503).json({
                success:false,
                message:verify.message
            })
        }
        return res.status(200).json({
            success:true,
            message:verify.message
        })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message || "Server side error while verifying product"
        })
    }
}

export const dashboardController = async (req,res) => {
    try {
        console.log('backend requrest for manager data');
        
        const result=await fetchUnverifiedProducts();
        if(!result.success) {
            return res.status(503).json({
                success:false,
                message:"Unable to find unverifed products"
            })
        }
        return res.status(200).json({
            success:true,
            products:result.products,
            message:"Unverified products fetched"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Server error while fetching products"
        })    
    }
}