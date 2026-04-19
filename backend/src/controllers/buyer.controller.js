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
    paymentDoneService,
    notInterestedService,
    getPendingRequestsService,
    getYourNotificationsService,
    markNotificationAsReadService,
    markAllNotificationsAsReadService,
    deleteNotificationService,
    createOrderService,
    verifyPaymentService,
    disputeOrderService,
    getBuyerOrdersService,
    buyerMarkDeliveredService,
} from "../services/buyer.service.js";

export const updateBuyerProfile = async (req, res, next) => {
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
            if (req.cloudinary.profilePic === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "No update fields provided",
                });
            }
        }
        console.log("My log : "+ req.cloudinary.profilePic);
        const response = await updateBuyerProfileService(buyerId, updateData, req.cloudinary.profilePic?.url);

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
        next(error);
    }
};

export const addToWishlist = async (req, res, next) => {
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
        next(error);
    }
};

export const getPendingRequests = async (req, res, next) => {
    try {
        const buyerId = req.user._id;
        const response = await getPendingRequestsService(buyerId);
        return res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export const removeFromWishlist = async (req, res, next) => {
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
        next(error);
    }
};

export const getWishlistProducts = async (req, res, next) => {
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
        next(error);
    }
}

export const requestProduct = async (req, res, next) => {
    try {
        const buyerId = req.user._id;
        const productId = req.params.productId;
        console.log(req.body);
        const { biddingPrice, shippingAddress } = req.body;

        if (!buyerId || !productId || !biddingPrice || !shippingAddress || !shippingAddress.pinCode) {
            return res.status(404).json({ message: "Missing buyerId, productId, biddingPrice or shippingAddress with pinCode" });
        }
        const response = await requestProductService(productId, buyerId, biddingPrice, shippingAddress);
        console.log("response in contr: ", response);
        if (!response.success) {
            return res.status(response.status || 400).json({
                success: false,
                message: response.message
            });
        }
        return res.status(200).json({
            success: true,
            message: response.message
        });

    } catch (error) {
        // console.log(error);
        next(error);
        // return res.status(500).json({
        //     success: false,
        //     message: error.message || "Internal server error"
        // });
    }
};

export const createOrder = async (req, res, next) => {
    try {
        const buyerId = req.user._id;
        const productId = req.body.productId || false;
        const subscription = req.body.subscription || false;

        if (!buyerId || (!!productId === !!subscription)) {
            return res.status(400).json({ message: "Missing buyerId or (productId and subscription) both are given or both are not given" });
        }

        const response = await createOrderService(buyerId, productId, subscription);

        if (!response.success) {
            return res.status(response.status || 400).json({
                success: false,
                message: response.message
            });
        }

        return res.status(201).json({
            success: true,
            message: response.message,
            order: response.order
        });

    } catch (error) {
        next(error);
    }
};

export const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }

        const secret = process.env.RAZORPAYKEYSECRET;
        const body = razorpay_order_id + '|' + razorpay_payment_id;

        const response = await verifyPaymentService(body,razorpay_order_id, razorpay_payment_id, razorpay_signature, secret);

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
}

export const paymentDone = async (req, res, next) => {
    try {
        const buyerId = req.user._id;
        const productId = req.params.productId;
        const { razorpay_payment_id } = req.body;
        if (!buyerId || !productId) {
            return res.status(404).json({ message: "Missing buyerId or productId" });
        }
        if (!razorpay_payment_id) {
            return res.status(400).json({
                success: false,
                message: "razorpay_payment_id is required",
            });
        }

        const response = await paymentDoneService(buyerId, productId, razorpay_payment_id);

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

export const getYourNotifications = async (req, res, next) => {
    try {
        const buyerId = req.user._id;
        if (!buyerId) {
            return res.status(404).json({ message: "Missing buyerId" });
        }
        const response = await getYourNotificationsService(buyerId);

        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message
            });
        }

        return res.status(200).json({
            success: true,
            notifications: response.notifications,
            unreadCount: response.unreadCount,
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
};

export const markNotificationAsRead = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const notificationId = req.params.notificationId;

        const response = await markNotificationAsReadService(userId, notificationId);

        if (!response.success) {
            return res.status(response.status || 400).json({
                success: false,
                message: response.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: response.message,
            notification: response.notification,
        });
    } catch (error) {
        next(error);
    }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const response = await markAllNotificationsAsReadService(userId);

        if (!response.success) {
            return res.status(response.status || 400).json({
                success: false,
                message: response.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: response.message,
            modifiedCount: response.modifiedCount,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const notificationId = req.params.notificationId;

        const response = await deleteNotificationService(userId, notificationId);

        if (!response.success) {
            return res.status(response.status || 400).json({
                success: false,
                message: response.message,
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

export const notInterested = async (req, res, next) => {
    try {
        const buyerId = req.user._id;
        const productId = req.params.productId;

        if (!buyerId || !productId) {
            return res.status(404).json({ message: "Missing buyerId or productId" });
        }
        const response = await notInterestedService(buyerId, productId);

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
        console.log(error);
        next(error);
    }
};

export const updateBuyerPassword = async (req, res, next) => {
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
        next(error);
    }
}

export const getYourProducts = async (req, res, next) => {
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
        next(error);
    }
}

export const rentProductController = async (req, res, next) => {
    try {
        const buyerId = req.user._id;
        const productId = req.params.productId;
        const { from, to, biddingPrice } = req.body;

        if (!buyerId || !productId || !from || !to || !biddingPrice) {
            return res.status(404).json({ message: "Missing buyerId or productId or from or to or biddingPrice" });
        }

        let respose = await rentService(buyerId, productId, from, to, biddingPrice);

        return res.status(respose.status).json({ success: respose.success, message: respose.message });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export const getYourProfile = async (req, res, next) => {
    try {
        const buyerId = req.user._id;
        const response = await getYouProfileService(buyerId);
        return res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export const disputeOrderController = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const buyerId = req.user._id;
        const { subject, description } = req.body;
        const attachments = req.cloudinary?.proofs || [];

        if (!subject || !description) {
            return res.status(400).json({ success: false, message: "Missing subject or description" });
        }

        const response = await disputeOrderService(orderId, buyerId, subject, description, attachments);
        if (!response.success) {
            return res.status(response.status || 400).json({ success: false, message: response.message });
        }
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const getBuyerOrdersController = async (req, res, next) => {
    try {
        const buyerId = req.user._id;
        const response = await getBuyerOrdersService(buyerId);
        return res.status(response.status || 200).json(response);
    } catch (error) {
        next(error);
    }
};

export const buyerMarkDeliveredController = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const buyerId = req.user._id;
        const response = await buyerMarkDeliveredService(orderId, buyerId);
        return res.status(response.status || 200).json(response);
    } catch (error) {
        next(error);
    }
};