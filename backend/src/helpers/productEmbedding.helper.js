import { OllamaEmbeddings } from "@langchain/ollama";
import { CHATBOT_CONFIG } from "../config/chatbot.config.js";

const embeddingsClient = new OllamaEmbeddings({
    model: CHATBOT_CONFIG.OLLAMA_EMBEDDING_MODEL,
    baseUrl: CHATBOT_CONFIG.OLLAMA_BASE_URL,
});

const formatValue = (value, fallback = "not provided") => {
    if (value === undefined || value === null) {
        return fallback;
    }

    const normalized = String(value).trim();
    return normalized.length ? normalized : fallback;
};

export const createProductStaticSentence = (productData = {}) => {
    const location = [
        formatValue(productData.city),
        formatValue(productData.district),
        formatValue(productData.state),
        formatValue(productData.zipCode),
    ].join(", ");

    const imageCount = Array.isArray(productData.images) ? productData.images.length : 0;
    const invoiceText = productData.invoice ? "invoice attached" : "invoice not attached";
    const listingType = productData.isRental ? "rental" : "sale";
    const soldStatus = productData.soldTo ? `sold to \"${formatValue(productData.soldTo)}\"` : "currently unsold";

    // return `Product \"${formatValue(productData.name)}\" in category \"${formatValue(productData.category)}\" is listed for ${listingType} at price \"${formatValue(productData.price)}\", with description \"${formatValue(productData.description)}\", located at \"${location}\", listed by seller \"${formatValue(productData.seller)}\", including ${imageCount} product images and ${invoiceText}, and is ${soldStatus}.`;
    return `${formatValue(productData.name)}. Category: ${formatValue(productData.category)}. ${formatValue(productData.description)}`;
};

export const generateProductOllamaEmbedding = async (productData = {}) => {
    const sentence = createProductStaticSentence(productData);
    const vector = await embeddingsClient.embedQuery(sentence);

    return {
        sentence,
        vector,
    };
};

export const generateSearchQueryEmbedding = async (rawText = '') => {
    const normalizedText = String(rawText || '').trim();
    if (!normalizedText) {
        return [];
    }

    // return embeddingsClient.embedQuery(normalizedText);
    return embeddingsClient.embedQuery(`A product matching: ${normalizedText}`);
};