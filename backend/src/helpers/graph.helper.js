import { ChatOllama } from "@langchain/ollama";
import {
    StateGraph,
    MessagesAnnotation,
    START,
    END,
    MemorySaver,
} from "@langchain/langgraph";
import { SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Assuming these are imported from your actual project structure
import { CHATBOT_CONFIG } from "../config/chatbot.config.js";
import { vectorSearchProducts } from "../daos/products.dao.js";
import { generateSearchQueryEmbedding } from "./productEmbedding.helper.js";

// ==========================================
// 1. SYSTEM PROMPTS & CONFIGURATION
// ==========================================

const SHOPPING_ASSISTANT_PROMPT = `You are a helpful, expert E-commerce Shopping Assistant. 
Your primary goal is to help users find the perfect products based on their specific needs, budget, and preferences.

You have access to a semantic search tool ('search_products'). 

CORE RULES:
1. ALWAYS USE YOUR TOOL: If a user asks for recommendations, prices, availability, or features of a product, you MUST use the 'search_products' tool to fetch real-time data. 
2. DO NOT HALLUCINATE: Never invent products, features, or prices. Only recommend items returned by your search tool.
3. BE CONCISE & STRUCTURED: When presenting products, use markdown bullet points. Include the Product Name, a brief highlight, and the Price.
4. ASK CLARIFYING QUESTIONS: If a user's request is too broad (e.g., "I need a laptop"), ask 1-2 clarifying questions (e.g., "What is your budget?" or "Is it for gaming or work?") before searching.
5. NO TOOL SPAM: If the search returns no results, politely inform the user and suggest alternative search terms. Do not repeatedly call the tool with the exact same query.

Tone: Friendly, professional, and concise.`;

// ==========================================
// 2. MODEL & TOOLS
// ==========================================

export const productSearchTool = tool(
    async ({ query }) => {
        try {
            const queryVector = await generateSearchQueryEmbedding(query);
            const results = await vectorSearchProducts({ queryVector });
            return JSON.stringify(results);
        } catch (error) {
            return JSON.stringify({ error: "Failed to search products. Please try again." });
        }
    },
    {
        name: "search_products",
        // Thorough description so the LLM knows EXACTLY when to trigger this
        description: "Search the marketplace catalog for products using semantic similarity. Use this tool WHENEVER the user asks to buy, find, explore, or compare products. Pass a descriptive search query based on the user's request.",
        schema: z.object({
            query: z.string().describe("A detailed search query for products (e.g., 'wireless noise-canceling headphones under $100')"),
        }),
    }
);

export const initializeModel = () => {
    return new ChatOllama({
        model: CHATBOT_CONFIG.OLLAMA_MODEL,
        temperature: CHATBOT_CONFIG.OLLAMA_TEMPERATURE,
    }).bindTools([productSearchTool]);
};

// ==========================================
// 3. GRAPH NODES & ROUTING
// ==========================================

export const createCallModelNode = (model) => {
    return async (state) => {
        // Inject the System Prompt at the very beginning of the message history
        // This ensures the model always remembers its instructions, even in long conversations.
        const messages = [
            new SystemMessage(SHOPPING_ASSISTANT_PROMPT),
            ...state.messages
        ];

        const response = await model.invoke(messages);
        
        // Return only the new response to be appended to the state
        return { messages: [response] };
    };
};

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
                    content: `Error: Tool ${toolCall.name} not found in agent configuration.`,
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

const routeAfterModel = (state) => {
    // Failsafe to prevent infinite loops between tool and model
    if (state.messages.length > 20) return END;
    
    const lastMessage = state.messages[state.messages.length - 1];

    // If the model decided it needs external data, route to the tools
    if (lastMessage.tool_calls?.length) {
        return "toolNode";
    }

    // Otherwise, it has finished reasoning and responding, end the loop
    return END;
};

// ==========================================
// 4. GRAPH INITIALIZATION
// ==========================================

export const initializeGraph = () => {
    const model = initializeModel();
    const callModel = createCallModelNode(model);

    const workflow = new StateGraph(MessagesAnnotation)
        .addNode("callModel", callModel)
        .addNode("toolNode", toolNode)
        .addEdge(START, "callModel")
        // NOTE: The direct edge to END was removed here, as routeAfterModel handles it perfectly.
        .addConditionalEdges("callModel", routeAfterModel)
        .addEdge("toolNode", "callModel");

    const checkpointer = new MemorySaver();
    const app = workflow.compile({ checkpointer });

    return { app, checkpointer, model };
};