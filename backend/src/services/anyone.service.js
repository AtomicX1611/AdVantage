import {
    getFeaturedProductsDao,
    getFreshProductsDao,
    getProductById,
    findProducts,
    vectorSearchProducts,
} from "../daos/products.dao.js";
import { generateSearchQueryEmbedding } from "../helpers/productEmbedding.helper.js";
import { cacheGet, cacheSet, KEYS, TTL } from "../config/cache.config.js";


export const getFeaturedFreshProductsService = async () => {
    const key = KEYS.homepage();

    const cached = await cacheGet(key);
    if (cached) {
        return {
            success: true,
            featuredProducts: cached.featuredProducts,
            freshProducts: cached.freshProducts,
        };
    }

    const [featuredProducts, freshProducts] = await Promise.all([
        getFeaturedProductsDao(),
        getFreshProductsDao()
    ]);

    const responseData = { featuredProducts, freshProducts };

    if (featuredProducts.length > 0 || freshProducts.length > 0) {
        await cacheSet(key, responseData, TTL.HOMEPAGE);
    }

    return {
        success: true,
        featuredProducts,
        freshProducts,
    }
}

export const getProductDetailsService = async (productId) => {
    const key = KEYS.productDetail(productId);

    const cached = await cacheGet(key);
    if (cached) {
        return {
            success: true,
            status: 200,
            product: cached,
            message: "Product details retrieved successfully",
        };
    }

    const product = await getProductById(productId);

    if (!product) {
        return {
            success: false,
            message: "Product not found",
            status: 404
        };
    }

    await cacheSet(key, product, TTL.PRODUCT_DETAIL);

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
        const normalizedName = query.name.trim();
        const queryVector = await generateSearchQueryEmbedding(query.name);

        if (!Array.isArray(queryVector) || queryVector.length === 0) {
            const fallbackFilters = {
                ...filters,
                $or: [
                    { name: { $regex: normalizedName, $options: 'i' } },
                    { description: { $regex: normalizedName, $options: 'i' } },
                    { category: { $regex: normalizedName, $options: 'i' } },
                ],
            };
            return findProducts(fallbackFilters);
        }

        const requestedLimit = Number(query.limit);
        const requestedCandidates = Number(query.numCandidates);
        const vectorResults = await vectorSearchProducts({
            queryVector,
            filters,
            limit: requestedLimit,
            numCandidates: requestedCandidates,
        });

        if (Array.isArray(vectorResults) && vectorResults.length > 0) {
            return vectorResults;
        }

        const fallbackFilters = {
            ...filters,
            $or: [
                { name: { $regex: normalizedName, $options: 'i' } },
                { description: { $regex: normalizedName, $options: 'i' } },
                { category: { $regex: normalizedName, $options: 'i' } },
            ],
        };

        return findProducts(fallbackFilters);
    }

    return findProducts(filters);
};