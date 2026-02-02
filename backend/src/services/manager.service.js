import { 
    verifyProductDao,
    findUnverifiedProducts
 } from "../daos/products.dao.js"
import { createProductVerifiedNotification } from "../helpers/notification.helper.js";

export const verifyProduct= async (productId) => {
    let response=await verifyProductDao(productId);
    await createProductVerifiedNotification(
        response.sellerId,
        productId,
        response.productName,
    );
    return response;
}

export const fetchUnverifiedProducts = async() =>{
    return await findUnverifiedProducts();
}