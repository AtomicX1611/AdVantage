import express from "express"
import { 
    verifyController,
    dashboardController,
    getComplaintsController,
    resolveComplaintController,
 } from "../controllers/manager.controller.js";

import {
    checkToken,
    authorize,
    serializeUser
} from '../middlewares/protect.js'
export const managerRouter=express.Router();
/**
 * @swagger
 * tags:
 *   - name: Manager routes
 *     description: Endpoints for managers (requires manager role)
 */

managerRouter.use(checkToken);
managerRouter.use(serializeUser); 
managerRouter.use(authorize("manager"));
 
/**
 * @swagger
 * /manager/d:
 *   get:
 *     summary: Get manager dashboard data (unverified products for manager category)
 *     tags: [Manager routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard products returned successfully
 */
managerRouter.get("/d",dashboardController);

/**
 * @swagger
 * /manager/verify:
 *   post:
 *     summary: Verify a product (manager action)
 *     tags: [Manager routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pid
 *             properties:
 *               pid:
 *                 type: string
 *                 description: Product id to verify
 *     responses:
 *       200:
 *         description: Product verified successfully
 */
managerRouter.post("/verify",verifyController);

/**
 * @swagger
 * /manager/complaints:
 *   get:
 *     summary: Get complaints for manager's category
 *     tags: [Manager routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Complaints returned successfully
 */
managerRouter.get("/complaints", getComplaintsController);

/**
 * @swagger
 * /manager/complaints/{complaintId}:
 *   patch:
 *     summary: Resolve a complaint by id
 *     tags: [Manager routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               resolution:
 *                 type: string
 *     responses:
 *       200:
 *         description: Complaint resolved successfully
 */
managerRouter.patch("/complaints/:complaintId", resolveComplaintController);
