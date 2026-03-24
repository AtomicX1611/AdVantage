import express from "express";
import { authorize, checkToken, serializeUser } from "../middlewares/protect.js";
import {getGraphData,getAllData,takeDownUser,takeDownManager,addManager,getMetrics,getPaymentAnalytics} from "../controllers/admin.controller.js"

const adminRouter = express.Router();
//Admin Login in authRoutes.

/**
 * @swagger
 * tags:
 *   - name: Admin routes
 *     description: Endpoints for admin users (requires admin role)
 */

adminRouter.use(checkToken);
adminRouter.use(serializeUser);
adminRouter.use(authorize('admin'));

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Retrieve aggregated admin dashboard data
 *     tags: [Admin routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated data returned successfully
 */
adminRouter.get('/',getAllData);

/**
 * @swagger
 * /admin/graphData:
 *   get:
 *     summary: Get product graph data for admin dashboard
 *     tags: [Admin routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Graph data returned successfully
 */
adminRouter.get('/graphData', getGraphData);

/**
 * @swagger
 * /admin/metrics:
 *   get:
 *     summary: Get computed admin metrics
 *     tags: [Admin routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics returned successfully
 */
adminRouter.get('/metrics', getMetrics);

/**
 * @swagger
 * /admin/paymentAnalytics:
 *   get:
 *     summary: Get payment analytics and trends
 *     tags: [Admin routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment analytics returned successfully
 */
adminRouter.get('/paymentAnalytics', getPaymentAnalytics);

/**
 * @swagger
 * /admin/addManager:
 *   post:
 *     summary: Add a new manager user
 *     tags: [Admin routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - category
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Manager created successfully
 */
adminRouter.post('/addManager', addManager);

/**
 * @swagger
 * /admin/remove/{userId}:
 *   delete:
 *     summary: Remove a user by id
 *     tags: [Admin routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User removed successfully
 */
adminRouter.delete('/remove/:userId',takeDownUser);

/**
 * @swagger
 * /admin/removeManager/{managerId}:
 *   delete:
 *     summary: Remove a manager by id
 *     tags: [Admin routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Manager removed successfully
 */
adminRouter.delete('/removeManager/:managerId',takeDownManager);

export default adminRouter