import express from "express";
import {
	chatController,
	endThreadController,
} from "../controllers/chatbot.controller.js";

export const chatbotRouter = express.Router();

chatbotRouter.post("/chat", chatController);
chatbotRouter.post("/chat/end", endThreadController);
chatbotRouter.delete("/chat/thread/:threadId", endThreadController);