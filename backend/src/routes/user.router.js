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
} from "../controllers/seller.controller.js";

export const router = express.Router();

router.use(checkToken);
router.use(serializeUser);
router.use(authorize("user"));

router.post("/request/:productId",requestProduct);
router.post("/paymentDone/:productId",paymentDone);//working
router.post("/notInterested/:productId",notInterested);
router.put("/rent/:productId",rentProductController);

router.put("/wishlist/add/:productId", addToWishlist); 
router.get("/wishlist", getWishlistProducts); // Working
router.get("/pendingRequests",getPendingRequests);

router.delete("/wishlist/remove/:productId", removeFromWishlist);
router.patch("/update/password",updateBuyerPassword); // Working
router.put("/update/profile", upload.single("profilePic"), updateBuyerProfile); // Working

router.get("/yourProducts",getYourProducts); 
router.get("/getYourProfile",getYourProfile);

router.get("/getNotifications", getYourNotifications);

// buyer as a seller
router.get("/products",findSellerProducts); // Working
router.get("/subscriptionStatus",findSellerSubscription); // Working
router.put("/update/subscription",updateSellerSubscription); // Working

router.post("/addProduct", upload.fields([
    { name: "productImages", maxCount: 10 },
    { name: "invoice", maxCount: 1 }
]), addProduct); // Working

router.delete("/deleteProduct/:productId",deleteProduct); // Working

router.delete("/rejectRequest/:productId/:buyerId/", rejectRequest);
router.post("/acceptRequest/:productId/:buyerId", acceptRequest);
router.patch("/revokeAccepted/:productId",revokeAcceptedRequest);

router.post("/makeAvailable/:productId",makeAvailableController);

export default router;