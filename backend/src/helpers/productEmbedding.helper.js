import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { CHATBOT_CONFIG } from "../config/chatbot.config.js";

const embeddingsClient = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACEHUB_API_KEY,
    model: CHATBOT_CONFIG.HF_EMBEDDING_MODEL,
});

const getExpectedEmbeddingDimension = () => {
    const dim = Number(CHATBOT_CONFIG.HF_EMBEDDING_DIMENSION);
    return Number.isFinite(dim) && dim > 0 ? dim : null;
};

const assertEmbeddingDimension = (vector, contextLabel) => {
    const expected = getExpectedEmbeddingDimension();
    if (!expected || !Array.isArray(vector)) {
        return;
    }

    if (vector.length !== expected) {
        throw new Error(
            `${contextLabel} embedding dimension mismatch: expected ${expected}, got ${vector.length}. ` +
            "Align HF_EMBEDDING_MODEL with the MongoDB vector index dimension."
        );
    }
};

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
    const soldStatus = productData.soldTo ? `sold to \"${formatValue(productData.soldTo)}\"` : "currently unsold";

    // return `Product \"${formatValue(productData.name)}\" in category \"${formatValue(productData.category)}\" at price \"${formatValue(productData.price)}\", with description \"${formatValue(productData.description)}\", located at \"${location}\", listed by seller \"${formatValue(productData.seller)}\", including ${imageCount} product images and ${invoiceText}, and is ${soldStatus}.`;
    return `${formatValue(productData.name)}. Category: ${formatValue(productData.category)}. ${formatValue(productData.description)}`;
};

export const generateProductHFEmbedding = async (productData = {}) => {
    const sentence = createProductStaticSentence(productData);
    const vector = await embeddingsClient.embedQuery(sentence);
    assertEmbeddingDimension(vector, "Product");

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
    const vector = await embeddingsClient.embedQuery(`A product matching: ${normalizedText}`);
    assertEmbeddingDimension(vector, "Search query");
    return vector;
};