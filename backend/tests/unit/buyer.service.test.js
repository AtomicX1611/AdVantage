import { createOrderService, verifyPaymentService } from "../../src/services/buyer.service.js";

import { getBuyerById } from "../../src/daos/users.dao.js";
import { razorpay } from "../../src/config/payment.config.js";
import {
  holdPoductWhilePaymentDao,
  releaseProductPaymentHoldDao,
} from "../../src/daos/products.dao.js";
import { createOrderDao, getOrderByIdDao, updateOrderStatusDao } from "../../src/daos/orders.dao.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";

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
  rentDao: jest.fn(),
  holdPoductWhilePaymentDao: jest.fn(),
  releaseProductPaymentHoldDao: jest.fn(),
  notInterestedDao: jest.fn(),
  getProductsSellerAccepted: jest.fn(),
}));

jest.mock("../../src/daos/orders.dao.js", () => ({
  createOrderDao: jest.fn(),
  getOrderByIdDao: jest.fn(),
  updateOrderStatusDao: jest.fn(),
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
});
