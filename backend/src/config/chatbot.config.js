// Chatbot configuration
export const CHATBOT_CONFIG = {
	THREAD_TTL_MS: Number(process.env.CHAT_THREAD_TTL_MS || 15 * 60 * 1000),

	THREAD_GC_INTERVAL_MS: Number(process.env.CHAT_THREAD_GC_INTERVAL_MS || 60 * 1000),

	OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama3.1:8b",
	OLLAMA_EMBEDDING_MODEL:
		process.env.OLLAMA_EMBEDDING_MODEL || process.env.OLLAMA_MODEL || "qwen3-embedding:latest",
	OLLAMA_BASE_URL: process.env.OLLAMABASEURL || "http://localhost:11434",
	OLLAMA_TEMPERATURE: 0.2,
};
