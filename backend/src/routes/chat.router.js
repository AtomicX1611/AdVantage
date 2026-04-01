import express from "express"
import { 
    checkToken,
    serializeUser,
    authorize,
 } from "../middlewares/protect.js";
import {
    getContacts,
    createContact,
    inboxController,
    saveController
} from "../controllers/chat.controller.js";

export const chatRouter=express.Router();

chatRouter.use(checkToken);
chatRouter.use(serializeUser);

//Contact routes
chatRouter.get("/contacts",getContacts);
chatRouter.post("/createContact/:id",createContact);

//Message routes
chatRouter.get("/messages/:id",inboxController);
chatRouter.post("/message/:id",saveController);