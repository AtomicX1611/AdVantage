import Products from "../models/Products.js";
import Order from "../models/Orders.js";

const getPaymentHoldExpiryMinutes = () => {
    const parsed = Number.parseInt(process.env.PAYMENT_HOLD_EXPIRY_MINUTES || "20", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 20;
};

const getBuyerRequest = (product, buyerId) => {
    return product.requests.find(req => req.buyer.toString() === buyerId.toString());
};

const canReplaceExistingPaymentHold = async (productId, holdExpiryMinutes) => {
    const latestCreatedOrder = await Order.findOne({
        productId,
        status: "created",
        paymentProcessed: false,
    }).sort({ createdAt: -1 });

    if (!latestCreatedOrder) {
        return true;
    }

    const holdAgeMs = Date.now() - new Date(latestCreatedOrder.createdAt).getTime();
    const isExpired = holdAgeMs > holdExpiryMinutes * 60 * 1000;

    if (!isExpired) {
        return false;
    }

    latestCreatedOrder.status = "cancelled";
    await latestCreatedOrder.save();
    return true;
};

export const getProductById = async (productId) => {
    // console.log(productId);

    const product = await Products.findById(productId)
        .select("-hf_embeddings")
        .populate({
            path: "requests.buyer",
            select: "username",
        })
        .populate({
            path: "seller",
            select: "username _id",
        });
    // delete product.hf_embeddings;
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

    if (product.soldTo) {
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

    if (product.soldTo) {
        return { success: false, reason: "already_sold" };
    }

    if (product.sellerAcceptedTo) {
        return { success: false, reason: "already_accepted" };
    }
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

    if (product.soldTo) {
        return { success: false, reason: "already_sold" };
    }

    const requestIndex = product.requests.findIndex(req => req.buyer.toString() === buyerId.toString());
    if (requestIndex === -1) {
        return { success: false, reason: "no_request" };
    }

    const stakeStatus = product.requests[requestIndex].sellerStakeStatus;
    const existingStakeId = product.requests[requestIndex].sellerStakeId;
    const existingStakeCreatedAt = product.requests[requestIndex].sellerStakeCreatedAt;
    const stakeExpiryMinutes = Number.parseInt(process.env.STAKE_ORDER_EXPIRY_MINUTES || "30", 10);
    const isStakeExpired = existingStakeCreatedAt
        ? (Date.now() - new Date(existingStakeCreatedAt).getTime()) > stakeExpiryMinutes * 60 * 1000
        : false;

    if (stakeStatus === 'Locked') {
        return { success: false, reason: "already_staked" };
    }

    if (stakeStatus === 'Pending' && existingStakeId && !isStakeExpired) {
        return { success: false, reason: "stake_pending" };
    }

    if (product.sellerAcceptedTo && product.sellerAcceptedTo.toString() === buyerId.toString()) {
        return { success: false, reason: "already_accepted" };
    }

    product.requests[requestIndex].sellerStakeId = razorpayOrderId;
    product.requests[requestIndex].sellerStakeAmount = stakeAmount;
    product.requests[requestIndex].sellerStakeStatus = 'Pending';
    product.requests[requestIndex].sellerStakeCreatedAt = new Date();

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
    if (product.soldTo) {
        return { success: false, reason: "already_sold" };
    }
    if (!product.sellerAcceptedTo) {
        return { success: false, reason: "no_accepted_request" };
    }
    if (product.paymentInProgress) {
        return { success: false, reason: "payment_in_progress" };
    }

    const acceptedBuyerId = product.sellerAcceptedTo;

    const hisRequest = product.requests.find(req => req.buyer.toString() === acceptedBuyerId.toString());
    let refundStakeAmount = 0;
    if (hisRequest && hisRequest.sellerStakeStatus === 'Locked') {
        refundStakeAmount = hisRequest.sellerStakeAmount;
    }
    // make the requests seller status back to pending and remove sellerAcceptedTo from product
    product.requests = product.requests.map(req => {
        if (req.buyer.toString() === acceptedBuyerId.toString()) {
            return {
                ...req,
                sellerStakeStatus: 'Pending',
                sellerStakeId: null,
            };
        }
        return req;
    });

    // product.requests = product.requests.filter(req => req.buyer.toString() !== acceptedBuyerId.toString());
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
    const holdExpiryMinutes = getPaymentHoldExpiryMinutes();
    const product = await Products.findById(productId);

    if (!product) {
        return { success: false, reason: "not_found" };
    }
    if (!product.sellerAcceptedTo || product.sellerAcceptedTo.toString() !== buyerId.toString()) {
        return { success: false, reason: "not_accepted_buyer" };
    }
    if (product.soldTo) {
        return { success: false, reason: "already_sold" };
    }
    const hisRequest = getBuyerRequest(product, buyerId);
    if (!hisRequest) {
        return { success: false, reason: "not_found" };
    }
    if (hisRequest.sellerStakeStatus !== 'Locked') {
        return { success: false, reason: "stake_not_locked" };
    }

    if (product.paymentInProgress) {
        const canReplaceHold = await canReplaceExistingPaymentHold(product._id, holdExpiryMinutes);
        if (!canReplaceHold) {
            return { success: false, reason: "payment_in_progress" };
        }
    }
    product.paymentInProgress = false;
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
    if (product.soldTo) {
        return { success: false, reason: "already_sold" };
    }
    const hisRequest = product.requests.find(req => req.buyer.toString() === buyerId.toString());
    if (!hisRequest) {
        return { success: false, reason: "not_found" }; // check this
    }
    if (!product.paymentInProgress) {
        return { success: false, reason: "payment_not_in_progress" };
    }

    product.price = hisRequest.biddingPrice;

    // Earnings must not be credited at payment time.
    // Credit/release happens only after buyer marks received OR 48h passes after seller delivery verification.

    // product.requests = [];
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
    if (product.soldTo) {
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
        .select("-hf_embeddings -requests -description -soldTo -invoice")
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
                hf_embeddings: 0,
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
    let products = await Products.find(filters).select("-hf_embeddings -requests -description -soldTo -invoice").lean();
    return products;
};

export const countProductsDao = async (filters) => {
    const count = await Products.countDocuments(filters);
    return count;
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
    const scoreThresholdRaw = Number.parseFloat(process.env.VECTOR_SEARCH_SCORE_THRESHOLD || "0.7");
    const scoreThreshold = Number.isFinite(scoreThresholdRaw)
        ? Math.min(Math.max(scoreThresholdRaw, 0), 1)
        : 0.7;

    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 30;
    const safeCandidates = Number.isFinite(numCandidates) && numCandidates > 0
        ? Math.max(numCandidates, safeLimit)
        : Math.max(10000, safeLimit * 5);

    const pipeline = [
        {
            $vectorSearch: {
                index: 'productSearchIndex',
                path: 'hf_embeddings',
                queryVector,
                numCandidates: safeCandidates,
                limit: safeLimit,
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
    results = results.filter((result) => result.score >= scoreThreshold);
    results = results.map((result) => {
        delete result.hf_embeddings;
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