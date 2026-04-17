import express from "express";
import {
    checkToken,
    serializeUser,
    authorize
} from "../middlewares/protect.js";
import {
    upload,
    uploadFilesToCloudinary,
} from "../middlewares/upload.js";
import {
    updateBuyerProfile,
    addToWishlist,
    removeFromWishlist,
    requestProduct,
    updateBuyerPassword,
    getWishlistProducts,
    getYourProducts,
    rentProductController,
    getYourProfile,
    paymentDone,
    notInterested,
    getPendingRequests,
    getYourNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    createOrder,
    verifyPayment,
} from "../controllers/buyer.controller.js";
import {
    addProduct,
    acceptRequest,
    rejectRequest,
    updateSellerSubscription,
    findSellerProducts,
    findSellerSubscription,
    makeAvailableController,
    deleteProduct,
    revokeAcceptedRequest,
    analyticsController,
    getTransactionsController,
} from "../controllers/seller.controller.js";
import {
    fileComplaint,
    getMyComplaints,
    getProductComplaints,
    getProductBuyers,
} from "../controllers/complaint.controller.js";

export const router = express.Router();

//router level middleware
router.use(checkToken);
router.use(serializeUser);
router.use(authorize("user"));

router.post("/request/:productId", requestProduct);
router.post('/create-order', createOrder);
router.post("/verify-payment", verifyPayment);
// router.post("/paymentDone/:productId",paymentDone);//working
router.post("/notInterested/:productId", notInterested);
router.put("/rent/:productId", rentProductController);

router.put("/wishlist/add/:productId", addToWishlist);
router.get("/wishlist", getWishlistProducts); // Working
router.get("/pendingRequests", getPendingRequests);

router.post("/request/:productId", requestProduct);
router.post("/paymentDone/:productId", paymentDone);
router.post("/notInterested/:productId", notInterested);
router.put("/rent/:productId", rentProductController);
router.put("/wishlist/add/:productId", addToWishlist);
router.get("/wishlist", getWishlistProducts);
router.get("/pendingRequests", getPendingRequests);
router.delete("/wishlist/remove/:productId", removeFromWishlist);
router.patch("/update/password", updateBuyerPassword); // Working
router.put("/update/profile", upload.single("profilePic"), uploadFilesToCloudinary, updateBuyerProfile); // Working

router.get("/yourProducts", getYourProducts);
router.get("/getYourProfile", getYourProfile);

router.patch("/update/password", updateBuyerPassword);
router.put("/update/profile", upload.single("profilePic"), updateBuyerProfile);
router.get("/yourProducts", getYourProducts);
router.get("/getYourProfile", getYourProfile);
router.get("/getNotifications", getYourNotifications);
router.patch("/notifications/:notificationId/read", markNotificationAsRead);
router.post("/notifications/mark-all-read", markAllNotificationsAsRead);
router.delete("/notifications/:notificationId", deleteNotification);

// buyer as a seller
router.get("/products", findSellerProducts);
router.get("/subscriptionStatus", findSellerSubscription);
router.put("/update/subscription", updateSellerSubscription);
router.post("/addProduct", upload.fields([
    { name: "productImages", maxCount: 10 },
    { name: "invoice", maxCount: 1 }
]), uploadFilesToCloudinary, addProduct); // Working

router.delete("/deleteProduct/:productId", deleteProduct); // Working

router.delete("/rejectRequest/:productId/:buyerId/", rejectRequest);
router.post("/acceptRequest/:productId/:buyerId", acceptRequest);
router.patch("/revokeAccepted/:productId", revokeAcceptedRequest);

router.post("/makeAvailable/:productId", makeAvailableController);

/*
    "/selling-analytics" for seller dashboard
    method:GET
*/

router.get("/selling-analytics", analyticsController);

router.get("/getMyTransactions", getTransactionsController);
// Complaint routes
router.post("/complaint", fileComplaint);
router.get("/complaints", getMyComplaints);
router.get("/complaints/product/:productId", getProductComplaints);
router.get("/complaints/buyers/:productId", getProductBuyers);

export default router;