import express from "express";
import axios from "axios";
import {
    buyerSignup,
    buyerLogin,
    adminLogin,
    managerLogin,
    getMyInfo,
    userLogout,
    googelSignIn,
    verifyEmailController
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

/*
    Route to handle verify email request
*/
router.post("/verify-email",verifyEmailController);
router.post('/login', buyerLogin);
router.delete("/logout",userLogout);

/*
    Route to handle Forget password yet to be included 
 */


// //seller
// router.post('/seller/signup', sellerSignup);
// router.post('/seller/login',sellerLogin);

//admin
router.post('/admin/login',adminLogin);
//manager
router.post('/manager/login',managerLogin);

router.get("/me",checkToken,serializeUser,getMyInfo);

export default router;