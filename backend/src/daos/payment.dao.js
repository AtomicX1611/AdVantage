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
