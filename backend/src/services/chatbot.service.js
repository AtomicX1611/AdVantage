import { HumanMessage } from "@langchain/core/messages";
import { CHATBOT_CONFIG } from "../config/chatbot.config.js";
import { markThreadSeen, readMessageText, cleanupExpiredThreads } from "../helpers/chatbot.helper.js";
import { initializeGraph } from "../helpers/graph.helper.js";

const { app, checkpointer } = initializeGraph();
const threadLastSeen = new Map();

const cleanupTimer = setInterval(() => {
	void cleanupExpiredThreads(threadLastSeen, checkpointer, CHATBOT_CONFIG.THREAD_TTL_MS);
}, CHATBOT_CONFIG.THREAD_GC_INTERVAL_MS);

cleanupTimer.unref?.();

export const askChatbotService = async (message, threadId) => {
	markThreadSeen(threadId, threadLastSeen);

	const result = await app.invoke(
		{ messages: [new HumanMessage(message)] },
		{ configurable: { thread_id: threadId } }
	);

	const aiMessage = result.messages[result.messages.length - 1];
	markThreadSeen(threadId, threadLastSeen);
	return readMessageText(aiMessage?.content);
};

export const endChatThreadService = async (threadId) => {
	if (!threadId || typeof threadId !== "string") {
		return;
	}

	await checkpointer.deleteThread(threadId);
	threadLastSeen.delete(threadId);
};

