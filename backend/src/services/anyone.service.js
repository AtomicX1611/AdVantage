import {
    getFeaturedProductsDao,
    getFreshProductsDao,
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