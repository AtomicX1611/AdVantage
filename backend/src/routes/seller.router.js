import express from "express";
import { checkToken, serializeUser, authorize } from "../middlewares/protect.js";
import { upload } from "../middlewares/upload.js";
import {
    addProduct,
    updateSellerProfile,
    acceptRequest,
    rejectRequest,
    updateSellerPassword
} from "../controllers/seller.controller.js";

export const router = express.Router();

router.use(checkToken);
router.use(serializeUser);
router.use(authorize("seller"));


router.put("/upate/password",updateSellerPassword);
router.put("/update/profile", upload.single("profilePic"), updateSellerProfile); // it must have profile pic, username, contact updation dynamically based on req.body
router.post("/addProduct", upload.fields([
    { name: "productImages", maxCount: 10 },
    { name: "invoice", maxCount: 1 }
]), addProduct);
router.delete("/rejectRequest/:productId/:buyerId/", rejectRequest);
router.delete("/acceptRequest/:productId/:buyerId", acceptRequest);
export default router;