import { 
    verifyProductDao,
    findUnverifiedProducts
 } from "../daos/products.dao.js"

export const verifyProduct= async (productId) => {
    let response=await verifyProductDao(productId);
    return response;
}

export const fetchUnverifiedProducts = async() =>{
    return await findUnverifiedProducts();
}