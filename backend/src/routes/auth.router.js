import express from "express";
import {
    buyerSignup,
    buyerLogin,
    adminLogin,
    managerLogin,
    getMyInfo,
    userLogout
} from "../controllers/auth.controller.js";
import {
    checkToken,
    serializeUser,
} from "../middlewares/protect.js";

export const router = express.Router();

//buyer
router.post('/signup', buyerSignup);
router.post('/login', buyerLogin);
router.delete("/logout",userLogout);

// //seller
// router.post('/seller/signup', sellerSignup);
// router.post('/seller/login',sellerLogin);

//admin
router.post('/admin/login',adminLogin);
//manager
router.post('/manager/login',managerLogin);

router.get("/me",checkToken,serializeUser,getMyInfo);

export default router;