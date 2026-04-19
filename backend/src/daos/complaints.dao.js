import Complaints from "../models/Complaints.js";
import Products from "../models/Products.js";
import Managers from "../models/Managers.js";

export const createComplaintDao = async (complaintData) => {
    const complaint = new Complaints(complaintData);
    return await complaint.save();
};

export const getComplaintByIdDao = async (complaintId) => {
    return await Complaints.findById(complaintId)
    .populate("orderId", "amount status deliveryStatus deliveredAt awbCode courierName timerTriggered48Hour")
        .populate("productId", "name category seller images")
        .populate("complainant", "username email")
        .populate("respondent", "username email")
        .populate("assignedManager", "email category");
};

export const getComplaintsByCategoryDao = async (category) => {
    // Find all products in this category, then find complaints for those products
    const productIds = await Products.find({ category }).select("_id");
    const ids = productIds.map(p => p._id);

    return await Complaints.find({ productId: { $in: ids } })
        .populate("orderId", "amount status deliveryStatus deliveredAt awbCode courierName timerTriggered48Hour")
        .populate("productId", "name category seller images price")
        .populate("complainant", "username email")
        .populate("respondent", "username email")
        .populate("assignedManager", "email category")
        .sort({ createdAt: -1 });
};

export const getComplaintsByUserDao = async (userId) => {
    return await Complaints.find({ complainant: userId })
    .populate("orderId", "amount status deliveryStatus deliveredAt")
        .populate("productId", "name category images price")
        .populate("respondent", "username email")
        .sort({ createdAt: -1 });
};

export const getComplaintsOnUserDao = async (userId) => {
    return await Complaints.find({ respondent: userId })
    .populate("orderId", "amount status deliveryStatus deliveredAt")
        .populate("productId", "name category images price")
        .populate("complainant", "username email")
        .sort({ createdAt: -1 });
};

export const getComplaintsForProductDao = async (productId) => {
    return await Complaints.find({ productId })
    .populate("orderId", "amount status deliveryStatus deliveredAt")
        .populate("complainant", "username email")
        .populate("respondent", "username email")
        .sort({ createdAt: -1 });
};

export const resolveComplaintDao = async (complaintId, managerId, status, resolution, additionalSetFields = {}) => {
    return await Complaints.findByIdAndUpdate(
        complaintId,
        {
            $set: {
                status,
                resolution: resolution || null,
                assignedManager: managerId,
                updatedAt: new Date(),
                ...additionalSetFields,
            },
        },
        { new: true }
    )
        .populate("orderId", "amount status deliveryStatus deliveredAt")
        .populate("productId", "name category")
        .populate("complainant", "username email")
        .populate("respondent", "username email");
};

export const getBuyersForProductDao = async (productId) => {
    const product = await Products.findById(productId)
        .populate("soldTo", "username email _id")
        .populate("requests.buyer", "username email _id");

    if (!product) return [];

    const buyers = [];
    const seenIds = new Set();

    // Add soldTo buyer
    if (product.soldTo) {
        const id = product.soldTo._id.toString();
        if (!seenIds.has(id)) {
            seenIds.add(id);
            buyers.push({
                _id: product.soldTo._id,
                username: product.soldTo.username,
                email: product.soldTo.email,
            });
        }
    }

    // Add all request buyers
    if (product.requests && product.requests.length > 0) {
        for (const req of product.requests) {
            if (req.buyer) {
                const id = req.buyer._id.toString();
                if (!seenIds.has(id)) {
                    seenIds.add(id);
                    buyers.push({
                        _id: req.buyer._id,
                        username: req.buyer.username,
                        email: req.buyer.email,
                    });
                }
            }
        }
    }

    return buyers;
};

export const countComplaintsByCategory = async () => {
    return await Complaints.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: "$product" },
        {
            $group: {
                _id: "$product.category",
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
    ]);
};
