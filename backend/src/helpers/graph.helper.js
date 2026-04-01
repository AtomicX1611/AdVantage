import { ChatOllama } from "@langchain/ollama";
import {
	StateGraph,
	MessagesAnnotation,
	START,
	END,
	MemorySaver,
} from "@langchain/langgraph";
import { CHATBOT_CONFIG } from "../config/chatbot.config.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { vectorSearchProducts } from "../daos/products.dao.js";
import { generateSearchQueryEmbedding } from "./productEmbedding.helper.js";

export const initializeModel = () => {
	return new ChatOllama({
		model: CHATBOT_CONFIG.OLLAMA_MODEL,
		temperature: CHATBOT_CONFIG.OLLAMA_TEMPERATURE,
	}).bindTools([productSearchTool]);
};

export const productSearchTool = tool(
	async ({ query }) => {
		const queryVector = await generateSearchQueryEmbedding(query);

		const results = await vectorSearchProducts({
			queryVector,
		});

		return JSON.stringify(results);
	},
	{
		name: "search_products",
		description: `Search for products from the marketplace using semantic search.Use this when user asks about buying, finding, or exploring products.`,
		schema: z.object({
			query: z.string().describe("Search query for products"),
		}),
	}
);

const routeAfterModel = (state) => {
	if (state.messages.length > 20) return END;
	const lastMessage = state.messages[state.messages.length - 1];

	if (lastMessage.tool_calls?.length) {
		return "toolNode";
	}

	return END;
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
// vector search Node for the chatbot over the products
export const toolNode = async (state) => {
	const lastMessage = state.messages[state.messages.length - 1];

	if (!lastMessage.tool_calls?.length) {
		return {};
	}

	const toolsMap = {
		search_products: productSearchTool,
	};

	const results = await Promise.all(
		lastMessage.tool_calls.map(async (toolCall) => {
			const tool = toolsMap[toolCall.name];

			if (!tool) {
				return {
					role: "tool",
					content: `Tool ${toolCall.name} not found`,
					tool_call_id: toolCall.id,
				};
			}

			const result = await tool.invoke(toolCall.args);

			return {
				role: "tool",
				content: result,
				tool_call_id: toolCall.id,
			};
		})
	);

	return { messages: results };
};

export const initializeGraph = () => {
	const model = initializeModel();
	// add tools
	const callModel = createCallModelNode(model);

	const workflow = new StateGraph(MessagesAnnotation)
		.addNode("callModel", callModel)
		.addNode("toolNode", toolNode)
		.addEdge(START, "callModel")
		.addEdge("callModel", END)
		.addConditionalEdges("callModel", routeAfterModel)
		.addEdge("toolNode", "callModel");

	const checkpointer = new MemorySaver();
	const app = workflow.compile({ checkpointer });

	return { app, checkpointer, model };
};
