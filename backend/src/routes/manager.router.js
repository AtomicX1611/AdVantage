import express from "express"
import { 
    loginController,
    verifyController,
    dashboardController
 } from "../controllers/manager.controller.js";

import {
    checkToken,
    authorize,
    serializeUser
} from '../middlewares/protect.js'
export const managerRouter=express.Router();

managerRouter.use(checkToken);
managerRouter.use(serializeUser);
managerRouter.use(authorize("manager"));

managerRouter.post("/verify",verifyController);
managerRouter.get("/dashboard",dashboardController);


