import express from "express"
import { 
    verifyController,
    dashboardController,
    getComplaintsController,
    resolveComplaintController,
    resolveEscrowComplaintController,
 } from "../controllers/manager.controller.js";

import {
    checkToken,
    authorize,
    serializeUser
} from '../middlewares/protect.js'

export const managerRouter = express.Router();

managerRouter.use(checkToken);
managerRouter.use(serializeUser); 
managerRouter.use(authorize("manager"));

managerRouter.get("/d", dashboardController);
managerRouter.post("/verify", verifyController);
managerRouter.get("/complaints", getComplaintsController);
managerRouter.patch("/complaints/:complaintId", resolveComplaintController);
managerRouter.post("/complaints/:complaintId/resolve-escrow", resolveEscrowComplaintController);
