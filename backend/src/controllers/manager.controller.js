import { 
    verifyProduct,
    fetchUnverifiedProducts,
    fetchUnverifiedProductsByCategory,
    fetchComplaintsByCategory,
    resolveComplaintService,
    resolveEscrowComplaintService,
 } from "../services/manager.service.js";

export const verifyController = async (req,res,next) => {
    const productId=req.body.pid;
    if(!productId) return res.status(400).json({
        success:false,
        message:"Product Id not found"
    });

    // Verify product belongs to manager's category
    try {
        const verify=await verifyProduct(productId,req.user._id, req.user.category);
        if(!verify.success) {
            return res.status(verify.status || 503).json({
                success:false,
                message:verify.message
            })
        }
        return res.status(200).json({
            success:true,
            message:verify.message
        })
        
    } catch (error) {
        next(error);
    }
}

export const dashboardController = async (req,res,next) => {
    try {
        const managerCategory = req.user.category;
        if (!managerCategory) {
            return res.status(400).json({
                success: false,
                message: "Manager category not found"
            });
        }
        
        const result = await fetchUnverifiedProductsByCategory(managerCategory);
        if(!result.success) {
            return res.status(503).json({
                success:false,
                message:"Unable to find unverified products"
            })
        }
        return res.status(200).json({
            success:true,
            products:result.products,
            category: managerCategory,
            message:"Unverified products fetched for category: " + managerCategory,
        })
    } catch (error) {
        next(error);
    }
}

export const getComplaintsController = async (req, res, next) => {
    try {
        const managerCategory = req.user.category;
        if (!managerCategory) {
            return res.status(400).json({
                success: false,
                message: "Manager category not found"
            });
        }

        const result = await fetchComplaintsByCategory(managerCategory);
        return res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
        next(error);
    }
};

export const resolveComplaintController = async (req, res, next) => {
    try {
        const { complaintId } = req.params;
        const { status, resolution } = req.body;
        const managerId = req.user._id;
        const managerCategory = req.user.category;

        if (!complaintId || !status) {
            return res.status(400).json({
                success: false,
                message: "Complaint ID and status are required"
            });
        }

        const result = await resolveComplaintService(complaintId, managerId, managerCategory, status, resolution);
        return res.status(result.success ? 200 : (result.status || 400)).json(result);
    } catch (error) {
        next(error);
    }
};

export const resolveEscrowComplaintController = async (req, res, next) => {
    try {
        const { complaintId } = req.params;
        const {
            actionType,
            resolution,
            buyerRefundAmount,
            buyerRefundPercent,
            sellerStakeReleaseAmount,
            decision,
        } = req.body;
        const managerId = req.user._id;
        const managerCategory = req.user.category;

        let mappedActionType = actionType;
        if (!mappedActionType && decision) {
            mappedActionType = decision === "Buyer_Win" ? "refund_buyer" : (decision === "Seller_Win" ? "reject_dispute" : undefined);
        }

        if (!complaintId || !mappedActionType) {
            return res.status(400).json({
                success: false,
                message: "Complaint ID and actionType are required"
            });
        }

        const result = await resolveEscrowComplaintService(complaintId, managerId, managerCategory, {
            actionType: mappedActionType,
            resolution,
            buyerRefundAmount,
            buyerRefundPercent,
            sellerStakeReleaseAmount,
        });
        return res.status(result.success ? 200 : (result.status || 400)).json(result);
    } catch (error) {
        next(error);
    }
};