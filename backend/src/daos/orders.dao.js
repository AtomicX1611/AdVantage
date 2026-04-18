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
            const buyerAmount = Number((order.amount / 100).toFixed(2));
            const stakeAmount = Number((buyerAmount * 0.2).toFixed(2));
            const payoutAmount = Number((buyerAmount + stakeAmount).toFixed(2));

            await PendingPayouts.create({
                recipientId: order.productId.seller,
                orderId: order._id,
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

export const shipOrderDao = async (orderId, sellerId, awbCode, courierName, deliveryDetails = {}) => {
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
    order.deliveryDetails = {
        expectedDeliveryDate: deliveryDetails.expectedDeliveryDate || null,
        trackingUrl: deliveryDetails.trackingUrl || null,
        notes: deliveryDetails.notes || null,
    };
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

export const getSellerOrdersDao = async (sellerId) => {
    // Find all products owned by seller
    const orders = await Order.find().populate('productId');
    const sellerOrders = orders.filter(o => o.productId && o.productId.seller && o.productId.seller.toString() === sellerId.toString());

    // We should also lazy check these
    for (let i = 0; i < sellerOrders.length; i++) {
        sellerOrders[i] = await lazyCheckOrder(sellerOrders[i]);
    }

    return sellerOrders;
};

export const getBuyerOrdersDao = async (buyerId) => {
    let orders = await Order.find({ buyerId: buyerId }).populate('productId');

    for (let i = 0; i < orders.length; i++) {
        orders[i] = await lazyCheckOrder(orders[i]);
    }

    return orders;
};

export const buyerMarkDeliveredDao = async (orderId, buyerId) => {
    let order = await Order.findById(orderId).populate('productId');
    if (!order) return { success: false, message: "Order not found" };

    if (order.buyerId.toString() !== buyerId.toString()) {
        return { success: false, message: "You don't own this order" };
    }

    if (order.deliveryStatus !== 'Pending' && order.deliveryStatus !== 'Shipped' && order.deliveryStatus !== 'Delivered') {
        return { success: false, message: "Order must be in Pending, Shipped, or Delivered status to confirm as received" };
    }

    order.deliveryStatus = 'Completed';
    order.timerTriggered48Hour = true;
    if (!order.deliveredAt) {
        order.deliveredAt = new Date();
    }
    await order.save();

    const buyerAmount = Number((order.amount / 100).toFixed(2));
    const stakeAmount = Number((buyerAmount * 0.2).toFixed(2));
    const payoutAmount = Number((buyerAmount + stakeAmount).toFixed(2));

    await PendingPayouts.create({
        recipientId: order.productId.seller,
        orderId: order._id,
        productId: order.productId._id,
        amount: payoutAmount,
        payoutType: "Seller_120_Percent",
        reason: "Buyer confirmed order as received",
    });

    return { success: true, order };
};

export const sellerCancelPaidOrderDao = async (orderId, sellerId) => {
    const order = await Order.findById(orderId).populate('productId');
    if (!order) {
        return { success: false, status: 404, message: "Order not found" };
    }

    if (!order.productId) {
        return { success: false, status: 400, message: "Order is not associated with a product" };
    }

    if (order.productId.seller.toString() !== sellerId.toString()) {
        return { success: false, status: 403, message: "You don't own this product" };
    }

    if (order.status !== 'paid') {
        return { success: false, status: 400, message: "Only paid orders can be cancelled by seller" };
    }

    if (order.deliveryStatus !== 'Pending') {
        return { success: false, status: 400, message: "Seller cancellation is allowed only before shipping" };
    }

    const buyerAmount = Number((order.amount / 100).toFixed(2));
    const sellerStakeAmount = Number((buyerAmount * 0.2).toFixed(2));

    await PendingPayouts.create({
        recipientId: order.buyerId,
        orderId: order._id,
        productId: order.productId._id,
        amount: buyerAmount,
        payoutType: "Buyer_100_Refund",
        reason: "Seller marked paid order as not interested before shipping",
    });

    await PendingPayouts.create({
        recipientId: order.productId.seller,
        orderId: order._id,
        productId: order.productId._id,
        amount: sellerStakeAmount,
        payoutType: "Seller_20_Refund",
        reason: "Stake refund after seller cancelled paid order before shipping",
    });

    order.status = 'cancelled';
    order.deliveryStatus = 'Cancelled';
    await order.save();

    order.productId.soldTo = null;
    order.productId.sellerAcceptedTo = null;
    order.productId.paymentInProgress = false;
    await order.productId.save();

    return {
        success: true,
        status: 200,
        message: "Order cancelled and refund entries added to pending payouts",
        order,
    };
};