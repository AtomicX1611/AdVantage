import express from "express";
import { authorize, checkToken, serializeUser } from "../middlewares/protect.js";
import {getGraphData,getAllData,takeDownUser,takeDownManager,getMetrics} from "../controllers/admin.controller.js"

const adminRouter = express.Router();
//Admin Login in authRoutes.

adminRouter.use(checkToken);
adminRouter.use(serializeUser);
adminRouter.use(authorize('admin'));

adminRouter.get('/',getAllData); // Working
adminRouter.get('/graphData', getGraphData); // Working
adminRouter.get('/metrics', getMetrics);
adminRouter.delete('/remove/:userId',takeDownUser); // Working
adminRouter.delete('/removeManager/:managerId',takeDownManager);

export default adminRouter