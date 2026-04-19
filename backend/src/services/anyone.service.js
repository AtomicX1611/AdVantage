import {
    getFeaturedProductsDao,
    getFreshProductsDao,
    getProductById,
    findProducts,
    vectorSearchProducts,
} from "../daos/products.dao.js";
import { generateSearchQueryEmbedding } from "../helpers/productEmbedding.helper.js";

import  redisClient  from "../config/Redis.config.js";


export const getFeaturedFreshProductsService = async () => {
    const cacheKey = "featuredFreshProducts";

    try {
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            console.log(' Cache Hit! Serving homepage products from Redis.');
            const parsedData = JSON.parse(cachedData);

            return {
                success: true,
                featuredProducts: parsedData.featuredProducts,
                freshProducts: parsedData.freshProducts,
            };
        }
    } catch (error) {
        console.error('Redis GET Error:', redisError);
    }

    console.log(' Cache MISS... Querying MongoDB...');

    const [featuredProducts, freshProducts] = await Promise.all([
        getFeaturedProductsDao(),
        getFreshProductsDao()
    ]);

    const responseData = {
        featuredProducts,
        freshProducts,
    };

    try {
        if (featuredProducts.length > 0 || freshProducts.length > 0) {
            await redisClient.set(cacheKey, JSON.stringify(responseData), 'EX', 60 * 60);
            console.log(' Homepage products cached in Redis.');
        }
    } catch (redisError) {
        console.error('Redis SET Error:', redisError);
    }

    return {
        success: true,
        featuredProducts,
        freshProducts,
    }
}

export const getProductDetailsService = async (productId) => {
    const cacheKey = `productDetails:${productId}`;

    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log(` Cache Hit! Serving product ${productId} details from Redis.`);
            return {
                success: true,
                status: 200,
                product: JSON.parse(cachedData),
                message: "Product details retrieved successfully",
            };
        }
    } catch (redisError) {
        console.error('Redis GET Error:', redisError);
    }

    console.log('Cache Miss.... Querying DB...');

    const product = await getProductById(productId);

    if (!product) {
        return {
            success: false,
            message: "Product not found",
            status: 404
        };
    }

    try {
        await redisClient.set(cacheKey, JSON.stringify(product), 'EX', 60 * 60);
        console.log(` Product ${productId} details cached in Redis.`);
    } catch (redisError) {
        console.error('Redis SET Error:', redisError);
    }
    return {
        success: true,
        message: "Product retrieved successfully",
        status: 200,
        product: product,
    };
}

export const getProductsService = async (query) => {
    const filters = {
        $or: [
            { soldTo: { $exists: false } },
            { soldTo: null }
        ]
    };

    if (query.isRental) {
        filters.isRental = query.isRental === 'true';
    }

    if (query.category) {
        filters.category = query.category;
    }

    if (query.verified !== undefined) {
        filters.verified = query.verified === 'true';
    }

    if (query.minPrice || query.maxPrice) {
        filters.price = {};
        if (query.minPrice) filters.price.$gte = Number(query.minPrice);
        if (query.maxPrice) filters.price.$lte = Number(query.maxPrice);
    }

    if (query.postingDate) {
        filters.postingDate = { $gte: new Date(query.postingDate) };
    }

    const hasName = typeof query.name === 'string' && query.name.trim().length > 0;

    if (hasName) {
        const queryVector = await generateSearchQueryEmbedding(query.name);

        if (!Array.isArray(queryVector) || queryVector.length === 0) {
            return [];
        }

        const requestedLimit = Number(query.limit);
        const requestedCandidates = Number(query.numCandidates);
        console.log(requestedCandidates);
        return vectorSearchProducts({
            queryVector,
            filters,
            limit: requestedLimit,
            numCandidates: requestedCandidates,
        });
    }

    return findProducts(filters);
};