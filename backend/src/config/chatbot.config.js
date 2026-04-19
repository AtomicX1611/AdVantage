// Chatbot configuration
export const CHATBOT_CONFIG = {
	THREAD_TTL_MS: Number(process.env.CHAT_THREAD_TTL_MS || 15 * 60 * 1000),

	THREAD_GC_INTERVAL_MS: Number(process.env.CHAT_THREAD_GC_INTERVAL_MS || 60 * 1000),

	HF_ROUTER_BASE_URL: process.env.HF_ROUTER_BASE_URL || "https://router.huggingface.co/v1",
	HF_MODEL: process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct",
	HF_EMBEDDING_MODEL:
		process.env.HF_EMBEDDING_MODEL || "sentence-transformers/all-MiniLM-L6-v2",
	HF_EMBEDDING_DIMENSION: Number(process.env.HF_EMBEDDING_DIMENSION || 384),
};
