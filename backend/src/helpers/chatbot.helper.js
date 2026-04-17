export const markThreadSeen = (threadId, threadLastSeen) => {
	threadLastSeen.set(threadId, Date.now());
};

export const readMessageText = (content) => {
	if (typeof content === "string") {
		return content;
	}

	if (Array.isArray(content)) {
		return content
			.map((part) => {
				if (typeof part === "string") {
					return part;
				}
				if (part && typeof part.text === "string") {
					return part.text;
				}
				return "";
			})
			.join("")
			.trim();
	}

	return "";
};

export const cleanupExpiredThreads = async (threadLastSeen, checkpointer, ttlMs) => {
	const now = Date.now();
	const expiredThreadIds = [];

	for (const [threadId, lastSeenAt] of threadLastSeen.entries()) {
		if (now - lastSeenAt > ttlMs) {
			expiredThreadIds.push(threadId);
		}
	}

	for (const threadId of expiredThreadIds) {
		try {
			await checkpointer.deleteThread(threadId);
		} catch (error) {
			console.error("Failed to cleanup expired chatbot thread:", threadId, error);
		} finally {
			threadLastSeen.delete(threadId);
		}
	}
};
