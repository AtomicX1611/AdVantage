import {
    getFeaturedProductsDao,
    getFreshProductsDao,
    getProductById,
    findProducts,
    vectorSearchProducts,
} from "../daos/products.dao.js";
import { generateSearchQueryEmbedding } from "../helpers/productEmbedding.helper.js";


export const getFeaturedFreshProductsService = async () => {
    const featuredProducts = await getFeaturedProductsDao();
    const freshProducts = await getFreshProductsDao();
    return {
        success: true,
        featuredProducts,
        freshProducts,
    }
}

export const getProductDetailsService = async (productId) => {
    const product = await getProductById(productId);
    // console.log(product);
    if (!product) {
        return {
            success: false,
            message: "Product not found",
            status: 404
        };
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