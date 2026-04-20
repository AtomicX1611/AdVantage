import {
  createOrderService,
  verifyPaymentService,
  notInterestedService,
  getBuyerOrdersService,
  buyerMarkDeliveredService,
} from "../../src/services/buyer.service.js";

import { getBuyerById } from "../../src/daos/users.dao.js";
import { razorpay } from "../../src/config/payment.config.js";
import {
  holdPoductWhilePaymentDao,
  notInterestedDao,
  releaseProductPaymentHoldDao,
  getProductById,
} from "../../src/daos/products.dao.js";
import {
  createOrderDao,
  getOrderByIdDao,
  updateOrderStatusDao,
  getBuyerOrdersDao,
  buyerMarkDeliveredDao,
} from "../../src/daos/orders.dao.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import PendingPayouts from "../../src/models/PendingPayouts.js";

jest.mock("../../src/daos/users.dao.js", () => ({
  getBuyerById: jest.fn(),
  updateBuyerById: jest.fn(),
  addToWishlistDao: jest.fn(),
  removeFromWishlistDao: jest.fn(),
  updateBuyerPassById: jest.fn(),
  getWishlistProductsDao: jest.fn(),
}));

jest.mock("../../src/config/payment.config.js", () => ({
  razorpay: {
    orders: {
      create: jest.fn(),
    },
  },
}));

jest.mock("../../src/daos/products.dao.js", () => ({
  addProductRequestDao: jest.fn(),
  getYourProductsDao: jest.fn(),
  holdPoductWhilePaymentDao: jest.fn(),
  releaseProductPaymentHoldDao: jest.fn(),
  notInterestedDao: jest.fn(),
  getProductsSellerAccepted: jest.fn(),
  getProductById: jest.fn(),
}));

jest.mock("../../src/models/PendingPayouts.js", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

jest.mock("../../src/daos/orders.dao.js", () => ({
  createOrderDao: jest.fn(),
  getOrderByIdDao: jest.fn(),
  updateOrderStatusDao: jest.fn(),
  disputeOrderDao: jest.fn(),
  getBuyerOrdersDao: jest.fn(),
  buyerMarkDeliveredDao: jest.fn(),
}));

jest.mock("../../src/helpers/user.helper.js", () => ({
  paymentDoneHelper: jest.fn(),
  updateSellerSubscriptionHelper: jest.fn(),
}));

jest.mock("../../src/helpers/notification.helper.js", () => ({
  createNewRequestNotification: jest.fn(),
  getUserNotificationsHelper: jest.fn(),
  markNotificationAsReadHelper: jest.fn(),
  markAllUserNotificationsAsReadHelper: jest.fn(),
  deleteUserNotificationHelper: jest.fn(),
}));

jest.mock("razorpay/dist/utils/razorpay-utils.js", () => ({
  validateWebhookSignature: jest.fn(),
}));

describe("buyer.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createOrderService rejects invalid subscription", async () => {
    const result = await createOrderService("u1", false, 99);

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  test("createOrderService creates subscription order", async () => {
    getBuyerById.mockResolvedValue({ _id: "u1", subscription: 0 });
    razorpay.orders.create.mockResolvedValue({
      id: "order_1",
      amount: 10000,
      currency: "INR",
      receipt: "receipt_1",
      notes: { subscription: "1", sellerId: "u1" },
    });
    createOrderDao.mockResolvedValue({ order: { _id: "db-order" } });

    const result = await createOrderService("u1", false, 1);

    expect(result.success).toBe(true);
    expect(razorpay.orders.create).toHaveBeenCalled();
    expect(createOrderDao).toHaveBeenCalled();
  });

  test("verifyPaymentService releases hold when signature invalid", async () => {
    getProductById.mockResolvedValue({ _id: "p1", seller: { _id: "s1" } });
    validateWebhookSignature.mockReturnValue(false);
    getOrderByIdDao.mockResolvedValue({
      success: true,
      order: { buyerId: "u1", productId: "p1", status: "created", paymentProcessed: false },
    });
    updateOrderStatusDao.mockResolvedValue({ success: true });

    const result = await verifyPaymentService("body", "order_1", "pay_1", "sig_1", "secret");

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(releaseProductPaymentHoldDao).toHaveBeenCalledWith("p1", "u1");
  });

  test("verifyPaymentService marks order paid when signature valid", async () => {
    validateWebhookSignature.mockReturnValue(true);
    getOrderByIdDao.mockResolvedValue({
      success: true,
      order: { buyerId: "u1", productId: "p1", status: "created", paymentProcessed: false },
    });
    updateOrderStatusDao.mockResolvedValue({ success: true });

    const result = await verifyPaymentService("body", "order_1", "pay_1", "sig_1", "secret");

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(updateOrderStatusDao).toHaveBeenCalledWith("order_1", "paid", {
      paymentId: "pay_1",
    });
  });

  test("notInterestedService creates seller 20% refund payout when stake exists", async () => {
    getProductById.mockResolvedValue({ _id: "product_1", seller: { _id: "seller_1" } });
    notInterestedDao.mockResolvedValue({
      success: true,
      refundStakeAmount: 200,
      sellerId: "seller_1",
    });

    const result = await notInterestedService("buyer_1", "product_1");

    expect(result.success).toBe(true);
    expect(PendingPayouts.create).toHaveBeenCalledWith({
      recipientId: "seller_1",
      productId: "product_1",
      amount: 200,
      payoutType: "Seller_20_Refund",
      reason: "Buyer marked as not interested after acceptance",
    });
  });

  test("notInterestedService skips payout when no locked stake", async () => {
    getProductById.mockResolvedValue({ _id: "product_1", seller: { _id: "seller_1" } });
    notInterestedDao.mockResolvedValue({
      success: true,
      refundStakeAmount: 0,
      sellerId: "seller_1",
    });

    const result = await notInterestedService("buyer_1", "product_1");

    expect(result.success).toBe(true);
    expect(PendingPayouts.create).not.toHaveBeenCalled();
  });

  test("getBuyerOrdersService returns orders from dao", async () => {
    const orders = [{ _id: "o1" }, { _id: "o2" }];
    getBuyerOrdersDao.mockResolvedValue(orders);

    const result = await getBuyerOrdersService("buyer_1");

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.orders).toEqual(orders);
  });

  test("buyerMarkDeliveredService maps dao failure", async () => {
    buyerMarkDeliveredDao.mockResolvedValue({
      success: false,
      message: "Order not found",
    });

    const result = await buyerMarkDeliveredService("order_1", "buyer_1");

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toBe("Order not found");
  });

  test("buyerMarkDeliveredService returns completion message on success", async () => {
    buyerMarkDeliveredDao.mockResolvedValue({
      success: true,
      order: { _id: "order_1", deliveryStatus: "Completed" },
    });

    const result = await buyerMarkDeliveredService("order_1", "buyer_1");

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.message).toBe("Order marked as received and completed");
  });
});
