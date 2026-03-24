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

/**
 * @swagger
 * tags:
 *   - name: Auth routes
 *     description: Authentication and user identity endpoints
 */

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Sign in / register via Google id token
 *     tags: [Auth routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Google login successful
 */
router.post('/google', googelSignIn)

//buyer
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Create a new buyer account (sends verification OTP)
 *     tags: [Auth routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - contact
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               contact:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: OTP sent to email
 */
router.post('/signup', buyerSignup);

/*
    Route to handle verify email request
*/
/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email with OTP and create account
 *     tags: [Auth routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified and account created (returns token)
 */
router.post("/verify-email",verifyEmailController);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Buyer login
 *     tags: [Auth routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful (sets token cookie)
 */
router.post('/login', buyerLogin);

/**
 * @swagger
 * /auth/logout:
 *   delete:
 *     summary: Logout user (clears token cookie)
 *     tags: [Auth routes]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.delete("/logout",userLogout);

/*
    Route to handle Forget password yet to be included 
 */


//admin
/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin login successful
 */
router.post('/admin/login',adminLogin);
//manager
/**
 * @swagger
 * /auth/manager/login:
 *   post:
 *     summary: Manager login
 *     tags: [Auth routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Manager login successful
 */
router.post('/manager/login',managerLogin);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Auth routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info returned
 */
router.get("/me",checkToken,serializeUser,getMyInfo);

export default router;
