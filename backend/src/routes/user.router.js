import express from "express";
import {
    checkToken,
    serializeUser,
    authorize
} from "../middlewares/protect.js";
import { upload } from "../middlewares/upload.js";
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
    getTransactionsController
} from "../controllers/seller.controller.js";
import {
    fileComplaint,
    getMyComplaints,
    getProductComplaints,
    getProductBuyers,
} from "../controllers/complaint.controller.js";

export const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: User routes
 *     description: Endpoints for authenticated buyer/seller actions
 */

//router level middleware
router.use(checkToken);
router.use(serializeUser);
router.use(authorize("user"));

/**
 * @swagger
 * /user/request/{productId}:
 *   post:
 *     summary: Request a product (place a bid)
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               biddingPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Request sent successfully
 */
router.post("/request/:productId",requestProduct);
/**
 * @swagger
 * /user/paymentDone/{productId}:
 *   post:
 *     summary: Confirm payment for a product
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment confirmed
 */
router.post("/paymentDone/:productId",paymentDone);//working
/**
 * @swagger
 * /user/notInterested/{productId}:
 *   post:
 *     summary: Mark product as not interested
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Marked as not interested
 */
router.post("/notInterested/:productId",notInterested);
/**
 * @swagger
 * /user/rent/{productId}:
 *   put:
 *     summary: Rent a product for a period
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *                 format: date
 *               to:
 *                 type: string
 *                 format: date
 *               biddingPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Rent request submitted
 */
router.put("/rent/:productId",rentProductController);

/**
 * @swagger
 * /user/wishlist/add/{productId}:
 *   put:
 *     summary: Add a product to wishlist
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product added to wishlist
 */
router.put("/wishlist/add/:productId", addToWishlist); 
/**
 * @swagger
 * /user/wishlist:
 *   get:
 *     summary: Get wishlist products for current user
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist returned
 */
router.get("/wishlist", getWishlistProducts); // Working
/**
 * @swagger
 * /user/pendingRequests:
 *   get:
 *     summary: Get pending product requests for current user
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending requests returned
 */
router.get("/pendingRequests",getPendingRequests);

/**
 * @swagger
 * /user/wishlist/remove/{productId}:
 *   delete:
 *     summary: Remove a product from wishlist
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed from wishlist
 */
router.delete("/wishlist/remove/:productId", removeFromWishlist);
/**
 * @swagger
 * /user/update/password:
 *   patch:
 *     summary: Update buyer password
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.patch("/update/password",updateBuyerPassword); // Working
/**
 * @swagger
 * /user/update/profile:
 *   put:
 *     summary: Update buyer profile (multipart/form-data for profilePic)
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               contact:
 *                 type: string
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/update/profile", upload.single("profilePic"), updateBuyerProfile); // Working

/**
 * @swagger
 * /user/yourProducts:
 *   get:
 *     summary: Get products posted by current user
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User products returned
 */
router.get("/yourProducts",getYourProducts); 

/**
 * @swagger
 * /user/getYourProfile:
 *   get:
 *     summary: Get current user's public profile
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 */
router.get("/getYourProfile",getYourProfile);

/**
 * @swagger
 * /user/getNotifications:
 *   get:
 *     summary: Get notifications for current user
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications returned
 */
router.get("/getNotifications", getYourNotifications);

// buyer as a seller

/**
 * @swagger
 * /user/products:
 *   get:
 *     summary: Get products where current user is seller
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller products returned
 */
router.get("/products",findSellerProducts); // Working

/**
 * @swagger
 * /user/subscriptionStatus:
 *   get:
 *     summary: Get subscription status for seller
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription status returned
 */
router.get("/subscriptionStatus",findSellerSubscription); // Working

/**
 * @swagger
 * /user/update/subscription:
 *   put:
 *     summary: Update seller subscription
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subscription:
 *                 type: number
 *     responses:
 *       200:
 *         description: Subscription updated
 */
router.put("/update/subscription",updateSellerSubscription); // Working

/**
 * @swagger
 * /user/addProduct:
 *   post:
 *     summary: Add a new product (multipart/form-data)
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               invoice:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product added successfully
 */
router.post("/addProduct", upload.fields([
    { name: "productImages", maxCount: 10 },
    { name: "invoice", maxCount: 1 }
]), addProduct); // Working

/**
 * @swagger
 * /user/deleteProduct/{productId}:
 *   delete:
 *     summary: Delete a product
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete("/deleteProduct/:productId",deleteProduct); // Working

/**
 * @swagger
 * /user/rejectRequest/{productId}/{buyerId}:
 *   delete:
 *     summary: Reject a buyer's request
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: buyerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request rejected
 */
router.delete("/rejectRequest/:productId/:buyerId/", rejectRequest);

/**
 * @swagger
 * /user/acceptRequest/{productId}/{buyerId}:
 *   post:
 *     summary: Accept a buyer's request
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: buyerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request accepted
 */
router.post("/acceptRequest/:productId/:buyerId", acceptRequest);

/**
 * @swagger
 * /user/revokeAccepted/{productId}:
 *   patch:
 *     summary: Revoke an accepted request for a product
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Accepted request revoked
 */
router.patch("/revokeAccepted/:productId",revokeAcceptedRequest);

/**
 * @swagger
 * /user/makeAvailable/{productId}:
 *   post:
 *     summary: Mark product as available
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product made available
 */
router.post("/makeAvailable/:productId",makeAvailableController);

/**
 * @swagger
 * /user/selling-analytics:
 *   get:
 *     summary: Get seller analytics for current user
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics returned
 */
router.get("/selling-analytics",analyticsController);

/**
 * @swagger
 * /user/getMyTransactions:
 *   get:
 *     summary: Get transactions for current user
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions returned
 */
router.get("/getMyTransactions",getTransactionsController);
// Complaint routes
/**
 * @swagger
 * /user/complaint:
 *   post:
 *     summary: File a complaint about a product or user
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - type
 *               - subject
 *               - description
 *             properties:
 *               productId:
 *                 type: string
 *               respondentId:
 *                 type: string
 *               type:
 *                 type: string
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Complaint filed successfully
 */
router.post("/complaint", fileComplaint);

/**
 * @swagger
 * /user/complaints:
 *   get:
 *     summary: Get complaints filed by current user
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Complaints returned
 */
router.get("/complaints", getMyComplaints);

/**
 * @swagger
 * /user/complaints/product/{productId}:
 *   get:
 *     summary: Get complaints for a product
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product complaints returned
 */
router.get("/complaints/product/:productId", getProductComplaints);

/**
 * @swagger
 * /user/complaints/buyers/{productId}:
 *   get:
 *     summary: Get buyers for a product (complaint view)
 *     tags: [User routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Buyers returned
 */
router.get("/complaints/buyers/:productId", getProductBuyers);

export default router;