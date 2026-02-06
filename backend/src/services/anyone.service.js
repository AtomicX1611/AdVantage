import {
    getFeaturedProductsDao,
    getFreshProductsDao,
    getProductById,
    findProducts,
} from "../daos/products.dao.js";


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
    if(!product){
        return {
            success: false,
            message: "Product not found",
            status: 404
        };
    }
    return {
        success: true,
        message: "Product retrieved successfully",
        status:200,
        product: product,
    };
}

export const getProductsService = async (query) => {
    const filters = { soldTo: null };
    filters.soldTo = { $in: [null, undefined] };

    if (query.name) {
        filters.name = { $regex: query.name, $options: "i" };
    }

    if (query.isRental) {
        filters.isRental = query.isRental === "true";
    }

    if (query.category) {
        filters.category = query.category;
    }

    if (query.verified !== undefined) {
        filters.verified = query.verified === "true";
    }

    if (query.minPrice || query.maxPrice) {
        filters.price = {};
        if (query.minPrice) filters.price.$gte = Number(query.minPrice);
        if (query.maxPrice) filters.price.$lte = Number(query.maxPrice);
    }

    if (query.postingDate) {
        filters.postingDate = { $gte: new Date(query.postingDate) };
    }

    console.log(filters);
    const products = await findProducts(filters);
    return products;
};