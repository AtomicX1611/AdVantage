import express from "express";
import { authorize, checkToken, serializeUser } from "../middlewares/protect.js";
import {getGraphData,getUsersData,takeDownSeller} from "../controllers/admin.controller.js"

const adminRouter = express.Router();
//Admin Login in authRoutes.
adminRouter.use(checkToken)
adminRouter.use(serializeUser)
adminRouter.use(authorize('admin'))

adminRouter.get('/',getUsersData);
adminRouter.get('/grahpData', getGraphData)
adminRouter.get('/remove/:sellerId',takeDownSeller)

export default adminRouter