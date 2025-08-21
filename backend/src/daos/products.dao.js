import Products from "../models/Products.js";

export const createProduct = async (productData) => {
    return await Products.create(productData);
};

export const addProductRequestDao = async (productId, buyerId) => {
    const product = await Products.findById(productId);

    if (!product) {
        return { success: false, reason: "not_found" };
    }

    if (product.seller.toString() === buyerId.toString()) {
        return { success: false, reason: "self_request" };
    }

    if (product.soldTo && product.soldTo.buyer) {
        return { success: false, reason: "already_sold" };
    }

    const alreadyRequested = product.requests.some(
        req => req.buyer.toString() === buyerId.toString()
    );

    if (alreadyRequested) {
        return { success: false, reason: "already_requested" };
    }

    product.requests.push({ buyer: buyerId });
    await product.save();

    return { success: true };
};

export const acceptProductRequestDao = async (productId, buyerId) => {
    const product = await Products.findById(productId);

    if (!product) {
        return { success: false, reason: "not_found" };
    }

    if (product.soldTo && product.soldTo.buyer) {
        return { success: false, reason: "already_sold" };
    }

    const isRequested = product.requests.some(
        req => req.buyer.toString() === buyerId.toString()
    );

    if (!isRequested) {
        return { success: false, reason: "no_request" };
    }

    product.soldTo = buyerId;
    product.requests = [];
    await product.save();

    return { success: true };
};

export const rejectProductRequestDao = async (productId, buyerId) => {
    const product = await Products.findById(productId);

    if (!product) {
        return { success: false, reason: "not_found" };
    }

    const isRequested = product.requests.some(
        req => req.buyer.toString() === buyerId.toString()
    );

    if (!isRequested) {
        return { success: false, reason: "no_request" };
    }

    product.requests = product.requests.filter(
        req => req.buyer.toString() !== buyerId.toString()
    );
    await product.save();

    return { success: true };
};

export const verifyProductDao = async (productId) =>{
    try {
        const product=await Products.findById({_id:productId});
        if(!product) return {
            success:false,
            message:"Product not found"
        },

        await Products.updateOne(
            {_id:productId},
            {$set:{verified:true}}
        )

        return {
            success:true,
            message:"Verified Product with id"
        }
    } catch (error) {
        return {
            success:false,
            message:"Database error"
        }
    }
}

export const findUnverifiedProducts = async () =>{
    try {
        const products=await Products.find({verified:false});
        return {
            success:true,
            products:products
        }
    } catch (error) {
        return {
            success:false,
            message:"database error"
        }
    }
}