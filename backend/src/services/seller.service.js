import {
    createProduct,
    getProductById,
    deleteProductDao,
    acceptProductRequestDao,
    rejectProductRequestDao,
    makeAvailableDao,
} from "../daos/products.dao.js";
import {
    getSellerById,
    updateSellerById,
    updateSellerPassById,
    // updateSellerSubscriptionDao
    findProductsForSeller,
    findSellerSubsDao
} from "../daos/sellers.dao.js";

export const addProductService = async (req) => {
    const {
        name,
        price,
        description,
        zipCode,
        category,
        district,
        city,
        state,
        isRental
    } = req.body;
    // console.log(req.body);

    if (!req.files?.productImages || req.files.productImages.length === 0) {
        throw new Error("At least one product image is required");
    }

    const images = req.files.productImages.map(file => file.path);
    const invoicePath = req.files.invoice?.[0]?.path || null;

    const isRental1 = (isRental !== undefined) ? true : false;

    const productData = {
        name,
        price,
        description,
        zipCode,
        category,
        district,
        city,
        state,
        seller: req.user._id,
        images,
        isRental: isRental1,
        invoice: invoicePath,
        soldTo: null,
    };
    // console.log("product data: ", productData);
    const newProduct = await createProduct(productData);
    return newProduct;
};

export const deleteProductService = async (sellerId, productId) => {
    try {
        // console.log("Ali told");
        const product = await getProductById(productId);
        if (!product) {
            return {
                success: false,
                status: 404,
                message: "Product not found"
            };
        }
        // console.log(" this "+sellerId.toString()+" , "+product.seller.toString());
        

        if (product.seller._id.toString() !== sellerId.toString()) {
            return {
                success: false,
                status: 403,
                message: "Unauthorized: You can delete only your own products"
            };
        }

        await deleteProductDao(productId);

        return {
            success: true,
            status: 200,
            message: "Product deleted successfully"
        };

    } catch (error) {
        console.error("Delete Product Service Error:", error);
        return {
            success: false,
            status: 500,
            message: error.message || "Internal server error"
        };
    }
};


export const updateSellerProfileService = async (sellerId, updateData, file) => {
    const allowedFields = ["username", "contact"];
    const filteredData = {};

    for (const key of allowedFields) {
        if (updateData[key] !== undefined) {
            filteredData[key] = updateData[key];
        }
    }

    if (Object.keys(filteredData).length === 0 && file === undefined) {
        return {
            success: false,
            status: 400,
            message: "No valid fields to update",
        };
    }

    if (file !== undefined) {
        filteredData.profilePicPath = file.path;
    }

    const updatedSeller = await updateSellerById(sellerId, filteredData);

    if (!updatedSeller) {
        return {
            success: false,
            status: 404,
            message: "Seller not found",
        };
    }
    const plainSeller = updatedSeller.toObject();
    delete plainSeller.password;

    return {
        success: true,
        updatedSeller: plainSeller,
    };
};

export const updateSellerSubscriptionService = async (sellerId, subscription) => {
    const seller = await getSellerById(sellerId);
    if (seller.subscription >= subscription) {
        return {
            success: false,
            message: "Seller already have better or Equal plan than the choosen one",
        };
    }
    seller.subscription = subscription;
    await seller.save();
    // const response = await updateSellerSubscriptionDao(sellerId,subscription);
    return {
        success: true,
        updatedSeller: seller,
    }
}

export const acceptProductRequestService = async (productId, buyerId) => {
    const result = await acceptProductRequestDao(productId, buyerId);

    if (!result.success) {
        const messages = {
            not_found: { status: 404, message: "Product not found" },
            already_sold: { status: 400, message: "Product already sold" },
            no_request: { status: 400, message: "No request from this buyer" }
        };
        return { success: false, ...messages[result.reason] };
    }

    return { success: true, message: "Request accepted and product marked as sold" };
};

export const rejectProductRequestService = async (productId, buyerId) => {
    const result = await rejectProductRequestDao(productId, buyerId);

    if (!result.success) {
        const messages = {
            not_found: { status: 404, message: "Product not found" },
            no_request: { status: 400, message: "No request from this buyer" }
        };
        return { success: false, ...messages[result.reason] };
    }

    return { success: true, message: "Request rejected successfully" };
};

export const updateSellerPasswordService = async (oldPassword, newPassword, userId) => {
    const seller = await getSellerById(userId);
    if (!seller) {
        return {
            success: false,
            status: 404,
            message: "Seller not found",
        };
    }

    if (seller.password !== oldPassword) {
        return {
            success: false,
            status: 401,
            message: "Old password is incorrect",
        };
    }

    await updateSellerPassById(userId, newPassword);

    return {
        success: true,
    };
};

export const sellerProdRetriveService = async (id) => {
    return await findProductsForSeller(id);
}

export const sellerSubsRetService = async (userId) => {
    return await findSellerSubsDao(userId);
}

export const makeAvailableService = async (sellerId, productId) => {
    try {
        const result = await makeAvailableDao(sellerId, productId);

        if (!result.success) {
            return {
                status: 400,
                success: false,
                message: result.message || "Could not make product available again"
            };
        }

        return {
            status: 200,
            success: true,
            message: "Product marked as available again",
            product: result.product
        };
    } catch (error) {
        console.error("Error in makeAvailableService:", error);
        return {
            success: false,
            message: "Internal server error while updating availability"
        };
    }
};