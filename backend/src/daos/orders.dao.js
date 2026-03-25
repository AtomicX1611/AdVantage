import Order from "../models/Orders.js";

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

export const getOrderByIdDao = async (orderId) => {
    const order = await Order.findOne({ id: orderId });
    if (!order) {
        return { success: false, message: "Order not found" };
    }
    return { success: true, order };
}

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