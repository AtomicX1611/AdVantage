import express from "express";
import { authorize, checkToken, serializeUser } from "../middlewares/protect.js";
import { getGraphData, getAllData, takeDownUser, takeDownManager, addManager, getMetrics, getPaymentAnalytics } from "../controllers/admin.controller.js";

const adminRouter = express.Router();

// Admin routes require auth + admin role
adminRouter.use(checkToken);
adminRouter.use(serializeUser);
adminRouter.use(authorize('admin'));

adminRouter.get('/', getAllData);
adminRouter.get('/graphData', getGraphData);
adminRouter.get('/metrics', getMetrics);
adminRouter.get('/paymentAnalytics', getPaymentAnalytics);

adminRouter.post('/addManager', addManager);
adminRouter.delete('/removeManager/:managerId', takeDownManager);
adminRouter.delete('/remove/:userId', takeDownUser);

export default adminRouter