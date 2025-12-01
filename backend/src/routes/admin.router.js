import express from "express";
import { authorize, checkToken, serializeUser } from "../middlewares/protect.js";
import {getGraphData,getUsersData,takeDownUser} from "../controllers/admin.controller.js"

const adminRouter = express.Router();
//Admin Login in authRoutes.

adminRouter.use(checkToken);
adminRouter.use(serializeUser);
adminRouter.use(authorize('admin'));

adminRouter.get('/',getUsersData); // Working
adminRouter.get('/graphData', getGraphData); // Working
adminRouter.delete('/remove/:userId',takeDownUser); // Working

export default adminRouter