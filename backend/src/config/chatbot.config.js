// Chatbot configuration
export const CHATBOT_CONFIG = {
	THREAD_TTL_MS: Number(process.env.CHAT_THREAD_TTL_MS || 15 * 60 * 1000),

	THREAD_GC_INTERVAL_MS: Number(process.env.CHAT_THREAD_GC_INTERVAL_MS || 60 * 1000),

	HF_MODEL: process.env.HF_MODEL || "HuggingFaceH4/zephyr-7b-beta",
	HF_EMBEDDING_MODEL:
		process.env.HF_EMBEDDING_MODEL || "sentence-transformers/all-MiniLM-L6-v2",
};
