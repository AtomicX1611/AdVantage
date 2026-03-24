import Order from "../models/Order.js";

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