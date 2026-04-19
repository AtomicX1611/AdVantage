import Payment from "../models/Payment.js";

// Create a new payment
export const createPayment = async (paymentData) => {
    return await Payment.create(paymentData);
};

// Get payment by ID
export const getPaymentById = async (paymentId) => {
    return await Payment.findById(paymentId)
        .populate('from', 'username email')
        .populate('to', 'username email')
        .populate('relatedEntityId');
};

// Get all payments
export const getAllPayments = async () => {
    return await Payment.find()
        .populate('from', 'username email')
        .populate('to', 'username email')
        .populate('relatedEntityId')
        .sort({ date: -1 });
};

// Get payments with filters
export const getPayments = async (filters) => {
    return await Payment.find(filters)
        .populate('from', 'username email')
        .populate('to', 'username email')
        .populate('relatedEntityId')
        .sort({ date: -1 });
};

// Get payments made by a specific user
export const getPaymentsByFrom = async (userId, fromModel) => {
    return await Payment.find({ from: userId, fromModel: fromModel })
        .populate('to', 'username email')
        .populate('relatedEntityId')
        .sort({ date: -1 });
};

// Get payments received by a specific user
export const getPaymentsByTo = async (userId, toModel) => {
    console.log("userId: ", userId);
    console.log("toModel: ", toModel);

    return await Payment.find({ to: userId, toModel: toModel })
        .populate('from', 'username email')
        .populate('relatedEntityId')
        .sort({ date: -1 });
};

// Get payments by type
export const getPaymentsByType = async (paymentType) => {
    return await Payment.find({ paymentType: paymentType })
        .populate('from', 'username email')
        .populate('to', 'username email')
        .populate('relatedEntityId')
        .sort({ date: -1 });
};

// Get payments within a date range
export const getPaymentsByDateRange = async (startDate, endDate) => {
    return await Payment.find({
        date: {
            $gte: startDate,
            $lte: endDate
        }
    })
        .populate('from', 'username email')
        .populate('to', 'username email')
        .populate('relatedEntityId')
        .sort({ date: -1 });
};

// Update payment by ID
export const updatePaymentById = async (paymentId, updateData) => {
    return await Payment.findByIdAndUpdate(
        paymentId,
        { $set: updateData },
        { new: true }
    );
};

// What is the purpose  ?
// Delete payment by ID
export const deletePaymentById = async (paymentId) => {
    return await Payment.findByIdAndDelete(paymentId);
};

// Count total payments
export const countPayments = async (filters = {}) => {
    return await Payment.countDocuments(filters);
};

// Get total payment amount for a user (sent)
export const getTotalPaymentsSent = async (userId, fromModel) => {
    const result = await Payment.aggregate([
        {
            $match: {
                from: userId,
                fromModel: fromModel
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$price" }
            }
        }
    ]);
    return result.length > 0 ? result[0].total : 0;
};

// Get total payment amount for a user (received)
export const getTotalPaymentsReceived = async (userId, toModel) => {
    const result = await Payment.aggregate([
        {
            $match: {
                to: userId,
                toModel: toModel
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$price" }
            }
        }
    ]);
    return result.length > 0 ? result[0].total : 0;
};

// Get payment statistics by type
export const getPaymentStatsByType = async () => {
    return await Payment.aggregate([
        {
            $group: {
                _id: "$paymentType",
                count: { $sum: 1 },
                totalAmount: { $sum: "$price" }
            }
        },
        {
            $sort: { totalAmount: -1 }
        }
    ]);
};

// Get recent payments (limit)
export const getRecentPayments = async (limit = 10) => {
    return await Payment.find()
        .populate('from', 'username email')
        .populate('to', 'username email')
        .populate('relatedEntityId')
        .sort({ date: -1 })
        .limit(limit);
};

// Get payments by related entity
export const getPaymentsByRelatedEntity = async (entityId, entityType) => {
    return await Payment.find({
        relatedEntityId: entityId,
        relatedEntityType: entityType
    })
        .populate('from', 'username email')
        .populate('to', 'username email')
        .populate('relatedEntityId')
        .sort({ date: -1 });
};

// Get payments for a specific product
export const getPaymentsByProduct = async (productId) => {
    return await Payment.find({
        relatedEntityId: productId,
        relatedEntityType: 'Products'
    })
        .populate('from', 'username email')
        .populate('to', 'username email')
        .populate('relatedEntityId')
        .sort({ date: -1 });
};

// Get total revenue for a product
export const getProductRevenue = async (productId) => {
    const result = await Payment.aggregate([
        {
            $match: {
                relatedEntityId: productId,
                relatedEntityType: 'Products'
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$price" },
                count: { $sum: 1 }
            }
        }
    ]);
    return result.length > 0 ? result[0] : { total: 0, count: 0 };
};

// Check if payment exists
export const paymentExists = async (paymentId) => {
    const payment = await Payment.findById(paymentId);
    return !!payment;
};

// ==================== PAYMENT ANALYTICS ====================

// Get revenue by product category (with product population)
export const getRevenueByCategory = async () => {
    return await Payment.aggregate([
        {
            $match: {
                relatedEntityType: 'Products',
                relatedEntityId: { $ne: null }
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'relatedEntityId',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: {
                path: '$product',
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $group: {
                _id: '$product.category',
                totalRevenue: { $sum: '$price' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { totalRevenue: -1 }
        }
    ]);
};

// Get revenue by state (location)
export const getRevenueByState = async () => {
    return await Payment.aggregate([
        {
            $match: {
                relatedEntityType: 'Products',
                relatedEntityId: { $ne: null }
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'relatedEntityId',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: {
                path: '$product',
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $group: {
                _id: '$product.state',
                totalRevenue: { $sum: '$price' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { totalRevenue: -1 }
        }
    ]);
};

// Get revenue by payment type
export const getRevenueByPaymentType = async () => {
    return await Payment.aggregate([
        {
            $group: {
                _id: '$paymentType',
                totalRevenue: { $sum: '$price' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { totalRevenue: -1 }
        }
    ]);
};

// Get monthly revenue trends
export const getMonthlyRevenue = async (months = 12) => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return await Payment.aggregate([
        {
            $match: {
                date: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                totalRevenue: { $sum: '$price' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 }
        }
    ]);
};

// Get detailed payments with product info for admin
export const getPaymentsWithProductDetails = async (limit = 50) => {
    return await Payment.aggregate([
        {
            $sort: { date: -1 }
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: 'users',
                localField: 'from',
                foreignField: '_id',
                as: 'fromUser'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'to',
                foreignField: '_id',
                as: 'toUser'
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'relatedEntityId',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $project: {
                _id: 1,
                price: 1,
                paymentType: 1,
                date: 1,
                fromUser: { $arrayElemAt: ['$fromUser.username', 0] },
                fromEmail: { $arrayElemAt: ['$fromUser.email', 0] },
                toUser: { $arrayElemAt: ['$toUser.username', 0] },
                toEmail: { $arrayElemAt: ['$toUser.email', 0] },
                productName: { $arrayElemAt: ['$product.name', 0] },
                productCategory: { $arrayElemAt: ['$product.category', 0] },
                productState: { $arrayElemAt: ['$product.state', 0] },
                productCity: { $arrayElemAt: ['$product.city', 0] },
                productDistrict: { $arrayElemAt: ['$product.district', 0] }
            }
        }
    ]);
};

// Get top performing categories by sales count
export const getTopCategories = async (limit = 5) => {
    return await Payment.aggregate([
        {
            $match: {
                relatedEntityType: 'Products',
                relatedEntityId: { $ne: null }
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'relatedEntityId',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: '$product'
        },
        {
            $group: {
                _id: '$product.category',
                salesCount: { $sum: 1 },
                totalRevenue: { $sum: '$price' },
                avgPrice: { $avg: '$price' }
            }
        },
        {
            $sort: { salesCount: -1 }
        },
        {
            $limit: limit
        }
    ]);
};

// Get top states by revenue
export const getTopStates = async (limit = 10) => {
    return await Payment.aggregate([
        {
            $match: {
                relatedEntityType: 'Products',
                relatedEntityId: { $ne: null }
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'relatedEntityId',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: '$product'
        },
        {
            $group: {
                _id: '$product.state',
                salesCount: { $sum: 1 },
                totalRevenue: { $sum: '$price' }
            }
        },
        {
            $sort: { totalRevenue: -1 }
        },
        {
            $limit: limit
        }
    ]);
};
