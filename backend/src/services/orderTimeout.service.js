import Order from "../models/Orders.js";
import { releaseProductPaymentHoldDao, getProductById } from "../daos/products.dao.js";
import { invalidateProductCaches } from "../config/cache.config.js";

const ORDER_PAYMENT_TIMEOUT_MS = Number(process.env.ORDER_PAYMENT_TIMEOUT_MS || 15 * 60 * 1000);
const ORDER_GC_INTERVAL_MS = Number(process.env.ORDER_GC_INTERVAL_MS || 60 * 1000);

let timeoutWorkerStarted = false;

export const expireStaleCreatedOrders = async () => {
    const cutoffTime = new Date(Date.now() - ORDER_PAYMENT_TIMEOUT_MS);

    const staleOrders = await Order.find({
        status: "created",
        createdAt: { $lte: cutoffTime },
    }).select("id productId buyerId");

    for (const order of staleOrders) {
        const updatedOrder = await Order.findOneAndUpdate(
            { id: order.id, status: "created" },
            { status: "failed" },
            { new: true }
        );

        if (!updatedOrder) {
            continue;
        }

        if (updatedOrder.productId) {
            await releaseProductPaymentHoldDao(updatedOrder.productId, updatedOrder.buyerId);

            // Payment hold released — product state changed
            try {
                const product = await getProductById(updatedOrder.productId);
                if (product) {
                    await invalidateProductCaches(updatedOrder.productId, product.seller._id || product.seller);
                }
            } catch (_) { /* best-effort in background worker */ }
        }
    }
};

export const startOrderTimeoutWorker = () => {
    if (timeoutWorkerStarted) {
        return;
    }

    timeoutWorkerStarted = true;

    void expireStaleCreatedOrders();

    const timer = setInterval(() => {
        void expireStaleCreatedOrders();
    }, ORDER_GC_INTERVAL_MS);

    if (typeof timer.unref === "function") {
        timer.unref();
    }
};
