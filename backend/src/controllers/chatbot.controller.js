import crypto from "node:crypto";
import {
	askChatbotService,
	endChatThreadService,
} from "../services/chatbot.service.js";

export const chatController = async (req, res, next) => {
	try {
		const { message, thread_id: incomingThreadId } = req.body;

		if (typeof message !== "string" || !message.trim()) {
			return res.status(400).json({
				success: false,
				message: "message is required and must be a non-empty string",
			});
		}

		const thread_id =
			typeof incomingThreadId === "string" && incomingThreadId.trim()
				? incomingThreadId
				: crypto.randomUUID
					? crypto.randomUUID()
					: `${Date.now()}`;

		const response = await askChatbotService(message.trim(), thread_id);

		return res.status(200).json({
			success: true,
			thread_id,
			response,
		});
	} catch (error) {
		next(error);
	}
};

export const endThreadController = async (req, res, next) => {
	try {
		const thread_id = req.body?.thread_id || req.params?.threadId;

		if (typeof thread_id !== "string" || !thread_id.trim()) {
			return res.status(400).json({
				success: false,
				message: "thread_id is required",
			});
		}

		await endChatThreadService(thread_id.trim());

		return res.status(200).json({
			success: true,
			thread_id: thread_id.trim(),
			message: "thread deleted",
		});
	} catch (error) {
		next(error);
	}
};

