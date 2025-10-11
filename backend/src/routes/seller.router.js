import express from "express";
import { checkToken, serializeUser, authorize } from "../middlewares/protect.js";
import { upload } from "../middlewares/upload.js";
import {
    addProduct,
    updateSellerProfile,
    acceptRequest,
    rejectRequest,
    updateSellerPassword,
    updateSellerSubscription,
    findSellerProducts,
    findSellerSubscription,
    makeAvailableController,
} from "../controllers/seller.controller.js";

export const router = express.Router();

router.use(checkToken);
router.use(serializeUser);
router.use(authorize("seller"));

router.get("/products",findSellerProducts);
router.get("/subscriptionStatus",findSellerSubscription);

router.put("/update/password",updateSellerPassword);
router.put("/update/profile", upload.single("profilePic"), updateSellerProfile); // it must have profile pic, username, contact updation dynamically based on req.body
router.put("/update/subscription",updateSellerSubscription);

router.post("/addProduct", upload.fields([
    { name: "productImages", maxCount: 10 },
    { name: "invoice", maxCount: 1 }
]), addProduct);

router.delete("/rejectRequest/:productId/:buyerId/", rejectRequest);
router.delete("/acceptRequest/:productId/:buyerId", acceptRequest);

router.post("/makeAvailable/:productId",makeAvailableController);
export default router;