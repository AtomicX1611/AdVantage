import { ChatOllama } from "@langchain/ollama";
import {
	StateGraph,
	MessagesAnnotation,
	START,
	END,
	MemorySaver,
} from "@langchain/langgraph";
import { CHATBOT_CONFIG } from "../config/chatbot.config.js";

export const initializeModel = () => {
	return new ChatOllama({
		model: CHATBOT_CONFIG.OLLAMA_MODEL,
		temperature: CHATBOT_CONFIG.OLLAMA_TEMPERATURE,
	});
};

export const createCallModelNode = (model) => {
	return async (state) => {
		// Future enhancements:
		// - Add RAG context injection here
		// - Add tool/function calling logic
		// - Add prompt engineering/templates
		// - Add response post-processing

		const response = await model.invoke(state.messages);
		return { messages: [response] };
	};
};


export const initializeGraph = () => {
	const model = initializeModel();
	// add tools
	const callModel = createCallModelNode(model);

	const workflow = new StateGraph(MessagesAnnotation)
		.addNode("callModel", callModel)
		.addEdge(START, "callModel")
		.addEdge("callModel", END);

	const checkpointer = new MemorySaver();
	const app = workflow.compile({ checkpointer });

	return { app, checkpointer, model };
};
