import Order from "../models/Orders.js";
import PendingPayouts from "../models/PendingPayouts.js";

export const createOrderDao = async (buyerId, productId, subscription, orderId, amount, currency, receipt, notes) => {
    const order = new Order({
        buyerId,
        productId,
        subscription,
        id: orderId,
        amount,
        currency,
        receipt,
        notes,
    });
    await order.save();
    return { success: true, order };
}

export const lazyCheckOrder = async (order) => {
    if (order.deliveryStatus === 'Delivered' && order.deliveredAt && !order.timerTriggered48Hour) {
        const fortyEightHours = 48 * 60 * 60 * 1000;
        if (Date.now() - new Date(order.deliveredAt).getTime() > fortyEightHours) {
            order.deliveryStatus = 'Completed';
            order.timerTriggered48Hour = true;
            await order.save();

            let stakeAmount = 0;
            if (order.productId && order.productId.requests) {
                const req = order.productId.requests.find(r => r.buyer.toString() === order.buyerId.toString());
                if (req && req.sellerStakeStatus === 'Locked') {
                    stakeAmount = req.sellerStakeAmount;
                    req.sellerStakeStatus = 'Refunded';
                    await order.productId.save();
                }
            }

            // amount from buyer + stake
            const payoutAmount = order.amount + stakeAmount;
            
            await PendingPayouts.create({
                recipientId: order.productId.seller,
                productId: order.productId._id,
                amount: payoutAmount,
                payoutType: "Seller_120_Percent",
                reason: "48-hour post-delivery window elapsed without dispute",
            });
        }
    }
    return order;
};

export const getOrderByIdDao = async (orderId) => {
    let order = await Order.findOne({ id: orderId }).populate('productId');
    if (!order) {
        return { success: false, message: "Order not found" };
    }
    order = await lazyCheckOrder(order);
    return { success: true, order };
}

export const getOrderByIdMongoDao = async (orderId) => {
    let order = await Order.findById(orderId).populate('productId');
    if (!order) {
        return { success: false, message: "Order not found" };
    }
    order = await lazyCheckOrder(order);
    return { success: true, order };
}

export const getOrderByProductAndBuyerDao = async (productId, buyerId) => {
    return await Order.findOne({ productId: productId, buyerId: buyerId }).populate('productId');
};

export const updateOrderStatusDao = async (orderId, status, extraUpdates = {}) => {
    const updateData = {
        status,
        ...extraUpdates,
    };

    const order = await Order.findOneAndUpdate({ id: orderId }, updateData, { new: true });
    if (!order) {
        return { success: false, message: "Order not found" };
    }
    return { success: true, order };
}

export const shipOrderDao = async (orderId, sellerId, awbCode, courierName) => {
    const order = await Order.findById(orderId).populate('productId');
    if (!order) return { status: 404, success: false, message: "Order not found" };

    if (!order.productId) return { status: 400, success: false, message: "Order is not associated with a product" };
    
    if (order.productId.seller.toString() !== sellerId.toString()) {
        return { status: 403, success: false, message: "You don't own this product" };
    }

    if (order.status !== "paid") {
        return { status: 400, success: false, message: "Order is not paid yet" };
    }

    order.awbCode = awbCode;
    order.courierName = courierName;
    order.deliveryStatus = "Shipped";
    await order.save();

    return { success: true, message: "Order shipped successfully", order };
};

export const verifyDeliveryDao = async (orderId, sellerId) => {
    const order = await Order.findById(orderId).populate('productId');
    if (!order) return { status: 404, success: false, message: "Order not found" };

    if (!order.productId) return { status: 400, success: false, message: "Order is not associated with a product" };
    
    if (order.productId.seller.toString() !== sellerId.toString()) {
        return { status: 403, success: false, message: "You don't own this product" };
    }

    if (order.deliveryStatus !== "Shipped") {
        return { status: 400, success: false, message: "Order is not in Shipped status" };
    }

    if (!order.awbCode) {
        return { status: 400, success: false, message: "AWB Code is missing" };
    }

    return { success: true, order };
};

export const markOrderDeliveredDao = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) return { success: false };
    
    order.deliveryStatus = "Delivered";
    order.deliveredAt = new Date();
    await order.save();
    return { success: true };
};

export const disputeOrderDao = async (orderId, buyerId) => {
    let order = await Order.findById(orderId).populate('productId');
    if (!order) {
        return { success: false, message: "Order not found" };
    }
    
    if (order.buyerId.toString() !== buyerId.toString()) {
        return { success: false, message: "You don't own this order" };
    }

    if (order.deliveryStatus !== 'Delivered') {
        return { success: false, message: "Order cannot be disputed before delivery" };
    }
    
    if (order.timerTriggered48Hour || order.deliveryStatus === 'Completed') {
        return { success: false, message: "48-hour window has elapsed, order is completed" };
    }

    order.deliveryStatus = 'Disputed';
    await order.save();

    return { success: true, order };
};