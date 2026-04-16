import {
    addProductService,
    acceptProductRequestService,
    rejectProductRequestService,
    // updateSellerProfileService,
    // updateSellerPasswordService,
    updateSellerSubscriptionService,
    sellerProdRetriveService,
    sellerSubsRetService,
    makeAvailableService,
    deleteProductService,
    revokeAcceptedRequestService,
    analyticsService,
    getTransactionsService
} from "../services/seller.service.js";

export const addProduct = async (req, res, next) => {
    try {
        const newProduct = await addProductService(req);
        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            data: newProduct,
        });
    } catch (err) {
        next(err);
    }
};

// export const updateSellerProfile = async (req, res) => {
//     try {
//         console.log(req.user);
//         const sellerId = req.user._id;
//         const updateData = req.body;

//         if (!sellerId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Seller ID is missing",
//             });
//         }

//         if (!updateData || Object.keys(updateData).length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No update fields provided",
//             });
//         }

//         const response = await updateSellerProfileService(sellerId, updateData, req.file);

//         if (!response.success) {
//             return res.status(response.status).json({
//                 success: false,
//                 message: response.message,
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Profile updated successfully",
//             updatedSeller: response.updatedSeller,
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message || "Internal server error",
//         });
//     }
// };

export const updateSellerSubscription = async (req, res, next) => {
    try {
        const sellerId = req.user._id;
        const { subscription } = req.body;
        if (subscription < 1) {
            return res.status(400).json({
                success: false,
                message: "Subscription cannot be less that 1",
            });
        }
        const response = await updateSellerSubscriptionService(sellerId, subscription);

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
        next(error);
    }
}

export const deleteProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const response = await deleteProductService(req.user._id, productId);

        return res.status(response.status).json({
            success: response.success,
            message: response.message
        });

    } catch (error) {
        next(error);
    }
};


export const acceptRequest = async (req, res, next) => {
    try {
        const { productId, buyerId } = req.params;
        console.log("product id: ", productId);
        console.log("buyerId: ", buyerId);

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
        next(error);
    }
};

export const revokeAcceptedRequest = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const response = await revokeAcceptedRequestService(productId);
        console.log(response);
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
        next(error);
    }
};

export const rejectRequest = async (req, res, next) => {
    try {
        // console.log("int reject Request");
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
        next(error);
    }
};

// export const updateSellerPassword = async (req, res) => {
//     try {
//         const { oldPassword, newPassword } = req.body;
//         const userId = req.user._id;

//         if (!oldPassword || !newPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Both oldPassword and newPassword are required",
//             });
//         }

//         const response = await updateSellerPasswordService(oldPassword, newPassword, userId);
//         // console.log(response);
//         if (!response.success) {
//             return res.status(response.status).json({
//                 success: false,
//                 message: response.message || "something went wrong",
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Password updated successfully",
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message || "Internal server error"
//         });
//     }
// };

export const findSellerProducts = async (req, res, next) => {
    try {
        const userId = req.user._id;
        if (!userId) return res.status(400).json({ message: "userId not found" });

        let response = await sellerProdRetriveService(userId);

        if (!response.success) {
            return res.status(500).json({
                success: false,
                message: response.message
            })
        }

        return res.status(200).json({
            success: true,
            products: response.products
        })
    } catch (error) {
        next(error);
    }
}

export const findSellerSubscription = async (req, res, next) => {
    try {
        const userId = req.user._id;
        if (!userId) return res.status(404).json({
            success: false,
            message: "userId not found"
        })

        const response = await sellerSubsRetService(userId);
        if (!response.success) {
            return res.status(409).json({
                success: false,
                message: response.message
            })
        }
        return res.status(200).json({
            success: true,
            subscription: response.subscription
        })
    } catch (error) {
        next(error);
    }
}

export const makeAvailableController = async (req, res, next) => {
    try {
        const sellerId = req.user._id;
        const productId = req.params.productId;

        let response = await makeAvailableService(sellerId, productId);
        return res.status(response.status).json({
            message: response.message,
            success: response.success,
        });
    } catch (error) {
        next(error);
    }
}

export const analyticsController = async(req, res, next) => {
    try {
        const userId = req.user._id;
        console.log("entered");

        if (!userId) return res.status(404).json({
            success: false,
            message: "userId not found"
        })

        const response = await analyticsService(userId);
        console.log("response: ",response);
        
        return res.status(response.status).json({
            message: response.message,
            success: response.success,
            data:response.data
        });
    } catch (error) {
        next(error);
    }
}

export const getTransactionsController = async (req,res,next) =>{
    try {
        const userId = req.user._id;
        
         if (!userId) return res.status(404).json({
            success: false,
            message: "userId not found"
        })

        const response = await getTransactionsService(userId);
        
        return res.status(response.status).json({
            success: response.success,
            received:response.received,
            paidTo:response.paidTo
        });
    } catch (error) {
        next(error);
    }
}