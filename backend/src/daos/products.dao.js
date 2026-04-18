import Products from "../models/Products.js";
import { updateEarnings } from "./users.dao.js";

export const getProductById = async (productId) => {
    // console.log(productId);

    const product = await Products.findById(productId)
        .select("-ollama_embeddings") 
        .populate({
            path: "requests.buyer",
            select: "username",
        })
        .populate({
            path: "seller",
            select: "username",
        });
    // delete product.ollama_embeddings;
    // console.log(product);
    return product;
};

export const createProduct = async (productData) => {
    return await Products.create(productData);
};

export const addProductRequestDao = async (productId, buyerId, biddingPrice, shippingAddress) => {
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

    // if (product.price > biddingPrice) {
    //     return { success: false, reason: "bidding_price_low" };
    // }

    const alreadyRequested = product.requests.some(
        req => req.buyer.toString() === buyerId.toString()
    );

    if (alreadyRequested) {
        return { success: false, reason: "already_requested" };
    }

    product.requests.push({ buyer: buyerId, biddingPrice: biddingPrice, shippingAddress: shippingAddress });
    await product.save();

    return {
        success: true,
        sellerId: product.seller,
        productName: product.name
    };
};

export const acceptProductRequestDao = async (productId, buyerId) => {
    const product = await Products.findById(productId);

    if (!product) {
        return { success: false, reason: "not_found" };
    }

    if (product.soldTo && product.soldTo.buyer) { // i think there is a mistake in the logic
        return { success: false, reason: "already_sold" };
    }

    if (product.sellerAcceptedTo) {
        return { success: false, reason: "already_accepted" };
    }
    console.log("requsst: ", product.requests);
    const isRequested = product.requests.some(
        req => req.buyer.toString() === buyerId.toString()
    );

    if (!isRequested) {
        return { success: false, reason: "no_request" };
    }

    product.sellerAcceptedTo = buyerId;
    // product.requests = product.requests.filter(
    //     req => req.buyer.toString() !== buyerId.toString()
    // );
    await product.save();

    return {
        success: true,
        sellerId: product.seller,
        productName: product.name,
    };
};

export const createStakeOrderDao = async (productId, buyerId, stakeAmount, razorpayOrderId) => {
    const product = await Products.findById(productId);
    if (!product) return { success: false, reason: "not_found" };

    if (product.soldTo && product.soldTo.buyer) {
        return { success: false, reason: "already_sold" };
    }

    const requestIndex = product.requests.findIndex(req => req.buyer.toString() === buyerId.toString());
    if (requestIndex === -1) {
        return { success: false, reason: "no_request" };
    }

    product.requests[requestIndex].sellerStakeId = razorpayOrderId;
    product.requests[requestIndex].sellerStakeAmount = stakeAmount;
    product.requests[requestIndex].sellerStakeStatus = 'Pending';
    
    await product.save();

    return { success: true };
};

export const verifyStakeDao = async (productId, buyerId, razorpayPaymentId) => {
    const product = await Products.findById(productId);
    if (!product) return { success: false, reason: "not_found" };

    const requestIndex = product.requests.findIndex(req => req.buyer.toString() === buyerId.toString());
    if (requestIndex === -1) {
        return { success: false, reason: "no_request" };
    }

    if (product.requests[requestIndex].sellerStakeStatus !== 'Pending') {
        return { success: false, reason: "already_verified" };
    }

    product.requests[requestIndex].sellerStakeStatus = 'Locked';
    await product.save();

    return { success: true, sellerId: product.seller, productName: product.name };
};

export const revokeAcceptedRequestDao = async (productId) => {
    const product = await Products.findById(productId);

    if (!product) {
        return { success: false, reason: "not_found" };
    }
    if (product.soldTo && product.soldTo.buyer) {
        return { success: false, reason: "already_sold" };
    }
    if (!product.sellerAcceptedTo) {
        return { success: false, reason: "no_accepted_request" };
    }
    if(product.paymentInProgress){
        return { success: false, reason: "payment_in_progress" };
    }

    const acceptedBuyerId = product.sellerAcceptedTo;

    const hisRequest = product.requests.find(req => req.buyer.toString() === acceptedBuyerId.toString());
    let refundStakeAmount = 0;
    if (hisRequest && hisRequest.sellerStakeStatus === 'Locked') {
        refundStakeAmount = hisRequest.sellerStakeAmount;
    }

    product.requests = product.requests.filter(req => req.buyer.toString() !== acceptedBuyerId.toString());
    product.sellerAcceptedTo = null;
    await product.save();

    return {
        success: true,
        buyerId: acceptedBuyerId,
        sellerId: product.seller,
        productName: product.name,
        refundStakeAmount: refundStakeAmount
    };
};

export const holdPoductWhilePaymentDao = async (buyerId, productId) => {
    const product = await Products.findById(productId);

    if (!product) {
        return { success: false, reason: "not_found" };
    }
    if (!product.sellerAcceptedTo || product.sellerAcceptedTo.toString() !== buyerId.toString()) {
        return { success: false, reason: "not_accepted_buyer" };
    }
    if (product.soldTo && product.soldTo.buyer) {
        return { success: false, reason: "already_sold" };
    }
    const hisRequest = product.requests.find(req => req.buyer.toString() === buyerId.toString());
    if (!hisRequest) {
        return { success: false, reason: "not_found" };
    }
    if (hisRequest.sellerStakeStatus !== 'Locked') {
        return { success: false, reason: "stake_not_locked" };
    }
    if(product.paymentInProgress) {
        return { success: false, reason: "payment_in_progress" };
    }
    product.paymentInProgress = true;
    await product.save();
    return {
        success: true,
        price: hisRequest.biddingPrice,
    };
};

/*
    few changes done here
    paymentDoneDao
*/
export const paymentDoneDao = async (buyerId, productId) => {
    const product = await Products.findById(productId);

    if (!product) {
        return { success: false, reason: "not_found" };
    }
    if (!product.sellerAcceptedTo || product.sellerAcceptedTo.toString() !== buyerId.toString()) {
        return { success: false, reason: "not_accepted_buyer" };
    }
    if (product.soldTo && product.soldTo.buyer) {
        return { success: false, reason: "already_sold" };
    }
    const hisRequest = product.requests.find(req => req.buyer.toString() === buyerId.toString());
    if (!hisRequest) {
        return { success: false, reason: "not_found" }; // check this
    }
    if (!product.paymentInProgress) {
        return { success: false, reason: "payment_not_in_progress" };
    }

    if (!product.isRental) {
        product.price = hisRequest.biddingPrice;
    }

    // adding product.price for both rental and sale items

    const sellerId = product.seller;
    let amount = 0;

    if (product.isRental) {
        const from = new Date(hisRequest.from);
        const to = new Date(hisRequest.to);

        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const days = Math.ceil((to - from) / millisecondsPerDay);

        amount = hisRequest.biddingPrice * days;
    }
    else {
        amount = hisRequest.biddingPrice;
    }

    // Ali change cheyyava according to comment
    updateEarnings(sellerId, amount);// Creating inconsitency better to have a hook in user model to update earnings whenever a product is sold

    product.requests = [];
    product.soldTo = buyerId;
    product.paymentInProgress = false;
    await product.save();
    // delete 
    return {
        success: true,
        sellerId: product.seller,
        price: hisRequest.biddingPrice,
        productName: product.name,
    };
}

export const notInterestedDao = async (buyerId, productId) => {
    const product = await Products.findById(productId);

    if (!product) {
        return { success: false, reason: "not_found" };
    }
    if (product.soldTo && product.soldTo.buyer) {
        return { success: false, reason: "already_sold" };
    }
    
    let refundStakeAmount = 0;
    const hisRequest = product.requests.find(req => req.buyer.toString() === buyerId.toString());
    if (hisRequest && hisRequest.sellerStakeStatus === 'Locked') {
        refundStakeAmount = hisRequest.sellerStakeAmount;
    }

    if (product.sellerAcceptedTo && product.sellerAcceptedTo.toString() === buyerId.toString()) {
        product.sellerAcceptedTo = null;
    }
    product.requests = product.requests.filter(
        req => req.buyer.toString() !== buyerId.toString()
    );
    await product.save();
    return { success: true, refundStakeAmount: refundStakeAmount, sellerId: product.seller };
};

export const rejectProductRequestDao = async (productId, buyerId) => {
    const product = await Products.findById(productId);
    // console.log("reject products");
    // console.log(product);

    if (!product) {
        return { success: false, reason: "not_found" };
    }

    const isRequested = product.requests.find(
        req => req.buyer.toString() === buyerId.toString()
    );

    if (!isRequested) {
        return { success: false, reason: "no_request" };
    }

    // Security check: Prevent rejection if the seller has already accepted and staked.
    // They must use the "Revoke Request" API instead.
    if (product.sellerAcceptedTo && product.sellerAcceptedTo.toString() === buyerId.toString() || isRequested.sellerStakeStatus === 'Locked') {
        return { success: false, reason: "already_accepted" };
    }

    product.requests = product.requests.filter(
        req => req.buyer.toString() !== buyerId.toString()
    );
    await product.save();
    return {
        success: true,
        sellerId: product.seller,
        productName: product.name,
    };
};

export const verifyProductDao = async (productId) => {
    try {
        const product = await Products.findById({ _id: productId });
        if (!product) return {
            success: false,
            message: "Product not found"
        },

            await Products.updateOne(
                { _id: productId },
                { $set: { verified: true } }
            )
        product.verified = true;
        product.save();
        return {
            success: true,
            message: "Verified Product with id: " + productId,
            sellerId: product.seller,
            productName: product.name,
        }
    } catch (error) {
        return {
            success: false,
            message: "Database error"
        }
    }
};

export const findUnverifiedProducts = async () => {
    try {
        const products = await Products.find({ verified: false }).populate('seller');
        return {
            success: true,
            products: products
        }
    } catch (error) {
        return {
            success: false,
            message: "database error"
        }
    }
};

export const findUnverifiedProductsByCategory = async (category) => {
    try {
        const products = await Products.find({ verified: false, category: category }).populate('seller');
        return {
            success: true,
            products: products
        }
    } catch (error) {
        return {
            success: false,
            message: "database error"
        }
    }
};

export const getYourProductsDao = async (buyerId) => {
    const products = await Products.find({ soldTo: buyerId });
    return products;
};

export const getProductsSellerAccepted = async (buyerId) => {
    const products = await Products.find({ sellerAcceptedTo: buyerId, soldTo: null })
        .populate('seller', 'username')
        .populate('requests.buyer', 'username');
    return products;
}


export const getFreshProductsDao = async () => {
    let products = await Products.find({ soldTo: null })
        .select("-ollama_embeddings -requests -description -soldTo -invoice")
        .sort({ postingDate: -1 })
        .limit(20)
        .populate("seller", "username subscription");
    return products;
};

export const getFeaturedProductsDao = async () => {
    // const productss = await Products.find();
    let products = await Products.aggregate([
        {
            $match: { soldTo: null }
        },
        {
            $lookup: {
                from: "sellers",
                localField: "seller",
                foreignField: "_id",
                as: "sellerInfo",
            },
        },
        { $unwind: "$sellerInfo" },
        {
            $sort: {
                "sellerInfo.subscription": -1,
                postingDate: -1,
            },
        },
        { $limit: 20 },
        {
            $project: {
                ollama_embeddings: 0,
                requests: 0,
                description: 0,
                soldTo: 0,
                invoice: 0
            }
        }
    ]);
    return products;
};

export const findProducts = async (filters) => {
    let products = await Products.find(filters).select("-ollama_embeddings -requests -description -soldTo -invoice").lean();
    return products;
};

export const countProductsDao = async (filters) => {
    const count = await Products.countDocuments(filters);
    return count;
};

export const rentDao = async (buyerId, productId, from, to, biddingPrice) => {
    try {
        let prod = await Products.findById(productId);
        if (!prod) {
            return {
                success: false,
                message: "Product not found",
                status: 404
            }
        }
        // prevent seller from creating rent request on own product
        if (prod.seller && prod.seller.toString() === buyerId.toString()) {
            return {
                success: false,
                message: "You cannot request your own product",
                status: 400
            }
        }
        if (prod.soldTo) {
            return {
                success: false,
                message: "Already taken",
                status: 400
            }
        }
        const alreadyRequested = prod.requests.some(
            (req) => req.buyer.toString() === buyerId.toString()
        );

        if (alreadyRequested) {
            return {
                success: false,
                message: "You have already requested this product",
                status: 400,
            };
        }
        console.log("required data: ", buyerId, from, to, biddingPrice)
        prod.requests.push({
            buyer: buyerId,
            from: from,
            to: to,
            biddingPrice: biddingPrice
        });
        await prod.save();
        return {
            success: true,
            message: "Rent request added",
            status: 200
        }
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Database error",
            status: 500
        }
    }
}

export const makeAvailableDao = async (sellerId, productId) => {
    try {
        const product = await Products.findOneAndUpdate(
            { _id: productId, seller: sellerId, isRental: true },
            { $set: { soldTo: null, sellerAcceptedTo: null } },
            { new: true }
        );

        if (!product) {
            return { success: false, message: "Product not found or not eligible" };
        }

        return { success: true, product };
    } catch (error) {
        console.error("Error in makeAvailableDao:", error);
        throw new Error("Database error while making product available again");
    }
};

export const deleteProductDao = async (productId) => {
    return await Products.findByIdAndDelete(productId);
};

export const findProductsForSeller = async (id) => {
    try {
        const products = await Products.find({ seller: id })
            .populate("seller")
            .populate({
                path: "requests.buyer",
                select: "username email profilePic"
            });
        return {
            success: true,
            products: products
        }
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Database error"
        }
    }
};

export const getAllProducts = async () => {
    return await Products.find()
        .populate('seller', 'username')
        .lean();
};

export const countAllProducts = async () => {
    return await Products.countDocuments();
};

export const getProductsByCategory = async () => {
    return await Products.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
};

export const countVerifiedProducts = async () => {
    return await Products.countDocuments({ verified: true });
};

export const countUnverifiedProducts = async () => {
    return await Products.countDocuments({ verified: { $ne: true } });
};

export const vectorSearchProducts = async ({
    queryVector,
    filters = {},
    numCandidates = 150,
    limit = 30,
}) => {
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 30;
    const safeCandidates = Number.isFinite(numCandidates) && numCandidates > 0
        ? Math.max(numCandidates, safeLimit)
        : Math.max(10000, safeLimit * 5);

    const pipeline = [
        {
            $vectorSearch: {
                index: 'productSearchIndex',
                path: 'ollama_embeddings',
                queryVector,
                numCandidates: safeCandidates,
                limit: 100,
                filter: filters,
            },
        },
        {
            $set: {
                score: { $meta: 'vectorSearchScore' },
            },
        },
    ];

    let results = await Products.aggregate(pipeline);
    results=results.filter((result) => result.score > 0.75);
    results=results.map((result) => {
        delete result.ollama_embeddings;
        delete result.requests;
        delete result.soldTo;
        delete result.invoice;
        delete result.description;
        delete result.seller;
        return result;
    });
    return results;
};

export const releaseProductPaymentHoldDao = async (productId, buyerId = null) => {
    const query = {
        _id: productId,
        soldTo: null,
    };

    if (buyerId) {
        query.sellerAcceptedTo = buyerId;
    }

    const product = await Products.findOneAndUpdate(
        query,
        { paymentInProgress: false },
        { new: true }
    );

    return { success: !!product };
};