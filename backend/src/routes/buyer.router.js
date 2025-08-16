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
} from "../controllers/buyer.controller.js";

export const router = express.Router();

router.use(checkToken);
router.use(serializeUser);
router.use(authorize("buyer"));

router.post("/request/:productId",requestProduct);
router.put("/wishlist/add/:productId", addToWishlist);
router.delete("/wishlist/remove/:productId", removeFromWishlist);
router.put("/update/password",updateBuyerPassword); 
router.put("/update/profile", upload.single("profilePic"), updateBuyerProfile);

export default router;