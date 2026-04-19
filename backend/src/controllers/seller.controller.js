import {
    addProductService,
    acceptProductRequestService,
    rejectProductRequestService,
    createStakeOrderService,
    verifyStakeService,
    shipOrderService,
    verifyDeliveryService,
    getSellerOrdersService,
    sellerCancelPaidOrderService,
    // updateSellerProfileService,
    // updateSellerPasswordService,
    updateSellerSubscriptionService,
    sellerProdRetriveService,
    sellerSubsRetService,
    makeAvailableService,
    deleteProductService,
    revokeAcceptedRequestService,
    analyticsService,
    getTransactionsService,
    setupSellerPayoutAccountService,
    getSellerPayoutAccountService,
    withdrawFinalizedBalanceService,
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

export const createStakeOrderController = async (req, res, next) => {
    try {
        const { productId, buyerId } = req.params;
        const response = await createStakeOrderService(productId, buyerId);

        if (!response.success) {
            return res.status(response.status || 400).json({ success: false, message: response.message });
        }
        return res.status(200).json({ success: true, order: response.order });
    } catch (error) {
        next(error);
    }
};

export const verifyStakeController = async (req, res, next) => {
    try {
        const { productId, buyerId } = req.params;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }

        const secret = process.env.RAZORPAYKEYSECRET;
        const body = razorpay_order_id + '|' + razorpay_payment_id;

        const response = await verifyStakeService(productId, buyerId, body, razorpay_order_id, razorpay_payment_id, razorpay_signature, secret);

        if (!response.success) {
            return res.status(response.status || 400).json({
                success: false,
                message: response.message
            });
        }
        return res.status(200).json({
            success: true,
            message: response.message,
        });
    } catch (error) {
        next(error);
    }
};

export const shipOrderController = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { awbCode, courierName, expectedDeliveryDate, trackingUrl, notes } = req.body;
        const sellerId = req.user._id;

        if (!awbCode || !courierName) {
            return res.status(400).json({ success: false, message: "Missing awbCode or courierName" });
        }

        const response = await shipOrderService(orderId, sellerId, awbCode, courierName, {
            expectedDeliveryDate,
            trackingUrl,
            notes,
        });
        if (!response.success) {
            return res.status(response.status || 400).json({ success: false, message: response.message });
        }
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const verifyDeliveryController = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const sellerId = req.user._id;

        const response = await verifyDeliveryService(orderId, sellerId);
        if (!response.success) {
            return res.status(response.status || 400).json({ success: false, message: response.message });
        }
        return res.status(200).json(response);
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

export const analyticsController = async (req, res, next) => {
    try {
        const userId = req.user._id;

        if (!userId) return res.status(404).json({
            success: false,
            message: "userId not found"
        })

        const response = await analyticsService(userId);

        return res.status(response.status).json({
            message: response.message,
            success: response.success,
            data: response.data
        });
    } catch (error) {
        next(error);
    }
}

export const getTransactionsController = async (req, res, next) => {
    try {
        const userId = req.user._id;

        if (!userId) return res.status(404).json({
            success: false,
            message: "userId not found"
        })

        const response = await getTransactionsService(userId);

        return res.status(response.status).json({
            success: response.success,
            paymentLedger: response.paymentLedger || [],
            payoutLedger: response.payoutLedger || [],
            withdrawalLedger: response.withdrawalLedger || [],
            summary: response.summary || {
                grossBuyerPayments: 0,
                settledEarnings: 0,
                pendingEarnings: 0,
                availableToWithdraw: 0,
                withdrawnToDate: 0,
                inProgressWithdrawals: 0,
                failedWithdrawals: 0,
            },
            received: response.received,
            paidTo: response.paidTo
        });
    } catch (error) {
        next(error);
    }
}

export const getSellerOrdersController = async (req, res, next) => {
    try {
        const sellerId = req.user._id;
        const response = await getSellerOrdersService(sellerId);
        return res.status(response.status || 200).json(response);
    } catch (error) {
        next(error);
    }
};

export const sellerCancelPaidOrderController = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const sellerId = req.user._id;

        const response = await sellerCancelPaidOrderService(orderId, sellerId);
        return res.status(response.status || 200).json(response);
    } catch (error) {
        next(error);
    }
};

export const createPayoutAccountController = async (req, res, next) => {
    try {
        const sellerId = req.user._id;
        const response = await setupSellerPayoutAccountService(sellerId, req.body || {});
        return res.status(response.status || 200).json(response);
    } catch (error) {
        next(error);
    }
};

export const getPayoutAccountController = async (req, res, next) => {
    try {
        const sellerId = req.user._id;
        const response = await getSellerPayoutAccountService(sellerId);
        return res.status(response.status || 200).json(response);
    } catch (error) {
        next(error);
    }
};

export const withdrawFinalizedBalanceController = async (req, res, next) => {
    try {
        const sellerId = req.user._id;
        const response = await withdrawFinalizedBalanceService(sellerId, req.body?.transferMode);
        return res.status(response.status || 200).json(response);
    } catch (error) {
        next(error);
    }
};