import express from "express";
import axios from "axios";
import {
    buyerSignup,
    buyerLogin,
    adminLogin,
    managerLogin,
    getMyInfo,
    userLogout,
    googleSignIn,
    verifyEmailController
} from "../controllers/auth.controller.js";
import {
    checkToken,
    serializeUser,
} from "../middlewares/protect.js";

export const router = express.Router();

router.post('/google', googleSignIn);
router.post('/signup', buyerSignup);
router.post('/verify-email', verifyEmailController);
router.post('/login', buyerLogin);
router.delete('/logout', userLogout);
router.post('/admin/login', adminLogin);
router.post('/manager/login', managerLogin);
router.get('/me', checkToken, serializeUser, getMyInfo);

export default router;
