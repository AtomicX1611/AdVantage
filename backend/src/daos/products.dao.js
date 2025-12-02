import Products from "../models/Products.js";

export const getProductById = async (productId) => {
    // console.log(productId);

    const product = await Products.findById(productId)
        .populate({
            path: "requests.buyer",
            select: "username",
        })
        .populate({
            path: "seller",
            select: "username",
        });

    return product;
};

export const createProduct = async (productData) => {
    return await Products.create(productData);
};

export const addProductRequestDao = async (productId, buyerId, biddingPrice) => {
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

    if (product.price > biddingPrice) {
        return { success: false, reason: "bidding_price_low" };
    }

    const alreadyRequested = product.requests.some(
        req => req.buyer.toString() === buyerId.toString()
    );

    if (alreadyRequested) {
        return { success: false, reason: "already_requested" };
    }

    product.requests.push({ buyer: buyerId, biddingPrice: biddingPrice });
    await product.save();

    return { success: true };
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
    console.log("requsst: ",product.requests);
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

    return { success: true };
};

export const revokeAcceptedRequestDao = async (productId) => {
    const product = await Products.findById(productId);

    if (!product) {
        return { success: false, reason: "not_found" };
    }
    if (product.soldTo && product.soldTo.buyer) {
        return { success: false, reason: "already_sold" };
    }
    if (product.sellerAcceptedTo === null) {
        return { success: false, reason: "no_accepted_request" };
    }
    product.sellerAcceptedTo = null;
    await product.save();
    return { success: true };
};

export const paymentDoneDao = async (buyerId, productId) => {
    const product = await Products.findById(productId);

    if (!product) {
        return { success: false, reason: "not_found" };
    }
    if (product.sellerAcceptedTo.toString() !== buyerId.toString()) {
        return { success: false, reason: "not_accepted_buyer" };
    }
    if (product.soldTo && product.soldTo.buyer) {
        return { success: false, reason: "already_sold" };
    }

    product.requests = [];
    product.soldTo = buyerId;
    await product.save();
    return { success: true };
}

export const notInterestedDao = async (buyerId, productId) => {
    const product = await Products.findById(productId);

    if (!product) {
        return { success: false, reason: "not_found" };
    }
    if (product.soldTo && product.soldTo.buyer) {
        return { success: false, reason: "already_sold" };
    }
    if (product.sellerAcceptedTo && product.sellerAcceptedTo.toString() === buyerId.toString()) {
        product.sellerAcceptedTo = null;
    }
    product.requests = product.requests.filter(
        req => req.buyer.toString() !== buyerId.toString()
    );
    await product.save();
    return { success: true };
};

export const rejectProductRequestDao = async (productId, buyerId) => {
    const product = await Products.findById(productId);
    // console.log("reject products");
    // console.log(product);

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
            message: "Verified Product with id"
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

export const getYourProductsDao = async (buyerId) => {
    const products = await Products.find({ soldTo: buyerId });
    return products;
};

export const getProductsSellerAccepted = async (buyerId) => {
    const products = await Products.find({ sellerAcceptedTo: buyerId })
        .populate('seller', 'username')
        .populate('requests.buyer', 'username');
    return products;
}


export const getFreshProductsDao = async () => {
    const products = await Products.find({ soldTo: null })
        .sort({ postingDate: -1 })
        .limit(20)
        .populate("seller", "username subscription");

    return products;
};

export const getFeaturedProductsDao = async () => {
    const productss = await Products.find();
    const products = await Products.aggregate([
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
    ]);
    return products;
};

export const findProducts = async (filters) => {
    return await Products.find(filters).lean();
};

export const countProductsDao = async (filters) => {
    const count = await Products.countDocuments(filters);
    return count;
};

export const rentDao = async (buyerId, productId, from, to) => {
    try {
        let prod = await Products.findById(productId);
        if (!prod) {
            return {
                success: false,
                message: "Product not found",
                status: 404
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
        prod.requests.push({
            buyer: buyerId,
            from: from,
            to: to,
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
            { $set: { soldTo: null,sellerAcceptedTo: null } },
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
            .populate("seller");
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