import express from "express";
import axios from "axios";
import {
    buyerSignup,
    buyerLogin,
    adminLogin,
    managerLogin,
    getMyInfo,
    userLogout
    googelSignIn,
} from "../controllers/auth.controller.js";
import {
    checkToken,
    serializeUser,
} from "../middlewares/protect.js";

export const router = express.Router();

//gifted-airway-483805-k5


router.post('/google', googelSignIn)
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