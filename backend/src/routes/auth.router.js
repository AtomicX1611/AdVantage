import express from "express";
import {
    buyerSignup,
    buyerLogin,
    adminLogin,
    managerLogin,
} from "../controllers/auth.controller.js";

export const router = express.Router();

//buyer
router.post('/buyer/signup', buyerSignup);
router.post('/buyer/login', buyerLogin);

// //seller
// router.post('/seller/signup', sellerSignup);
// router.post('/seller/login',sellerLogin);

//admin
router.post('/admin/login',adminLogin);
//manager
router.post('/manager/login',managerLogin);

export default router;