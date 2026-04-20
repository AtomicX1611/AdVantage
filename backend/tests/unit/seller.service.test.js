process.env.RAZORPAYKEYID = "test_key_id";
process.env.RAZORPAYKEYSECRET = "test_key_secret";

jest.mock("../../src/config/payment.config.js", () => ({
  razorpay: {
    orders: {
      create: jest.fn()
    },
    payments: {
      fetch: jest.fn()
    }
  }
}));

import {
  addProductService,
  acceptProductRequestService,
  analyticsService,
  createStakeOrderService,
  getSellerOrdersService,
  rejectProductRequestService,
  revokeAcceptedRequestService,
  sellerCancelPaidOrderService,
  shipOrderService,
  verifyStakeService,
} from "../../src/services/seller.service.js";

import {
  acceptProductRequestDao,
  createProduct,
  createStakeOrderDao,
  findProductsForSeller,
  getProductById,
  rejectProductRequestDao,
  revokeAcceptedRequestDao,
  verifyStakeDao,
} from "../../src/daos/products.dao.js";
import { razorpay } from "../../src/config/payment.config.js";
import { sellerCancelPaidOrderDao } from "../../src/daos/orders.dao.js";
import { getSellerOrdersDao, shipOrderDao } from "../../src/daos/orders.dao.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import { generateProductHFEmbedding } from "../../src/helpers/productEmbedding.helper.js";
import { getBuyerById, incrementUsedPostsDao, resetUsedPostsDao } from "../../src/daos/users.dao.js";
import { getSellerWithdrawalsDao } from "../../src/daos/payout.dao.js";

import {
  createRequestAcceptedNotification,
  createRequestRejectedNotification,
  createRequestRevokedNotification,
} from "../../src/helpers/notification.helper.js";
import PendingPayouts from "../../src/models/PendingPayouts.js";

jest.mock("../../src/daos/products.dao.js", () => ({
  createProduct: jest.fn(),
  getProductById: jest.fn(),
  deleteProductDao: jest.fn(),
  acceptProductRequestDao: jest.fn(),
  rejectProductRequestDao: jest.fn(),
  revokeAcceptedRequestDao: jest.fn(),
  createStakeOrderDao: jest.fn(),
  verifyStakeDao: jest.fn(),
  findProductsForSeller: jest.fn(),
}));

jest.mock("../../src/daos/orders.dao.js", () => ({
  shipOrderDao: jest.fn(),
  verifyDeliveryDao: jest.fn(),
  markOrderDeliveredDao: jest.fn(),
  getSellerOrdersDao: jest.fn(),
  sellerCancelPaidOrderDao: jest.fn(),
}));

jest.mock("../../src/daos/users.dao.js", () => ({
  getBuyerById: jest.fn(),
  findSellerSubsDao: jest.fn(),
  incrementUsedPostsDao: jest.fn(),
  resetUsedPostsDao: jest.fn(),
}));

jest.mock("../../src/daos/payout.dao.js", () => ({
  createPayoutAccountDao: jest.fn(),
  createSellerWithdrawalDao: jest.fn(),
  getActivePayoutAccountBySellerDao: jest.fn(),
  getProcessingWithdrawalBySellerDao: jest.fn(),
  getSellerWithdrawalsDao: jest.fn(),
  getWithdrawablePayoutsDao: jest.fn(),
  markPayoutsAsLinkedToWithdrawalDao: jest.fn(),
  markWithdrawalPayoutExecutionDao: jest.fn(),
  unlinkPayoutsFromWithdrawalDao: jest.fn(),
  updateSellerWithdrawalDao: jest.fn(),
}));

jest.mock("../../src/daos/payment.dao.js", () => ({
  createPayment: jest.fn(),
  getPaymentsByFrom: jest.fn(),
  getPaymentsByTo: jest.fn(),
}));

jest.mock("../../src/daos/admins.dao.js", () => ({
  getAdminById: jest.fn(),
  getAllAdmins: jest.fn(),
}));

jest.mock("../../src/helpers/notification.helper.js", () => ({
  createRequestAcceptedNotification: jest.fn(),
  createRequestRejectedNotification: jest.fn(),
  createRequestRevokedNotification: jest.fn(),
}));

jest.mock("../../src/helpers/productEmbedding.helper.js", () => ({
  generateProductHFEmbedding: jest.fn(),
}));

jest.mock("../../src/models/PendingPayouts.js", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock("razorpay/dist/utils/razorpay-utils.js", () => ({
  validateWebhookSignature: jest.fn(),
}));

describe("seller.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("acceptProductRequestService handles failure reason", async () => {
    acceptProductRequestDao.mockResolvedValue({ success: false, reason: "no_request" });

    const result = await acceptProductRequestService("p1", "b1");

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  test("acceptProductRequestService sends notification on success", async () => {
    acceptProductRequestDao.mockResolvedValue({
      success: true,
      sellerId: "s1",
      productName: "Phone",
    });

    const result = await acceptProductRequestService("p1", "b1");

    expect(result.success).toBe(true);
    expect(createRequestAcceptedNotification).toHaveBeenCalledWith("b1", "s1", "p1", "Phone");
  });

  test("rejectProductRequestService sends notification on success", async () => {
    rejectProductRequestDao.mockResolvedValue({
      success: true,
      sellerId: "s1",
      productName: "Phone",
    });

    const result = await rejectProductRequestService("p1", "b1");

    expect(result.success).toBe(true);
    expect(createRequestRejectedNotification).toHaveBeenCalled();
  });

  test("revokeAcceptedRequestService sends notification on success", async () => {
    getProductById.mockResolvedValue({ _id: "p1", seller: { _id: "s1" } });
    revokeAcceptedRequestDao.mockResolvedValue({
      success: true,
      sellerId: "s1",
      buyerId: "b1",
      productName: "Phone",
    });

    const result = await revokeAcceptedRequestService("p1");

    expect(result.success).toBe(true);
    expect(createRequestRevokedNotification).toHaveBeenCalledWith("b1", "s1", "p1", "Phone");
  });

  test("sellerCancelPaidOrderService returns success", async () => {
    sellerCancelPaidOrderDao.mockResolvedValue({
      success: true,
      status: 200,
      message: "Order cancelled and refund entries added to pending payouts",
      order: { _id: "o1" },
    });

    const result = await sellerCancelPaidOrderService("o1", "s1");

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(sellerCancelPaidOrderDao).toHaveBeenCalledWith("o1", "s1");
  });

  test("sellerCancelPaidOrderService surfaces DAO errors", async () => {
    sellerCancelPaidOrderDao.mockResolvedValue({
      success: false,
      status: 400,
      message: "Seller cancellation is allowed only before shipping",
    });

    const result = await sellerCancelPaidOrderService("o1", "s1");

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toBe("Seller cancellation is allowed only before shipping");
  });

  test("createStakeOrderService blocks duplicate stake payment after lock", async () => {
    getProductById.mockResolvedValue({
      _id: "p1",
      sellerAcceptedTo: "b1",
      requests: [
        {
          buyer: { _id: "b1" },
          biddingPrice: 1000,
          sellerStakeStatus: "Locked",
        },
      ],
    });

    const result = await createStakeOrderService("p1", "b1");

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toBe("Request already accepted. Stake already deposited.");
  });

  test("createStakeOrderService allows fresh request with default Pending and no stake id", async () => {
    getProductById.mockResolvedValue({
      _id: "p1",
      sellerAcceptedTo: null,
      requests: [
        {
          buyer: { _id: "b1" },
          biddingPrice: 1000,
          sellerStakeStatus: "Pending",
          sellerStakeId: undefined,
        },
      ],
    });

    razorpay.orders.create.mockResolvedValue({
      id: "order_stake_1",
      amount: 20000,
      currency: "INR",
      receipt: "stake_receipt_1",
      notes: { productId: "p1", buyerId: "b1", type: "seller_stake" },
    });

    createStakeOrderDao.mockResolvedValue({ success: true });

    const result = await createStakeOrderService("p1", "b1");

    expect(result.success).toBe(true);
    expect(razorpay.orders.create).toHaveBeenCalled();
    expect(createStakeOrderDao).toHaveBeenCalledWith("p1", "b1", 200, "order_stake_1");
  });

  test("createStakeOrderService blocks non-expired pending stake order", async () => {
    const recentStake = new Date(Date.now() - 5 * 60 * 1000);
    getProductById.mockResolvedValue({
      _id: "p1",
      sellerAcceptedTo: null,
      requests: [
        {
          buyer: { _id: "b1" },
          biddingPrice: 1000,
          sellerStakeStatus: "Pending",
          sellerStakeId: "stake_old_1",
          sellerStakeCreatedAt: recentStake,
        },
      ],
    });

    const result = await createStakeOrderService("p1", "b1");

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toBe("Stake payment is already in progress for this request.");
    expect(razorpay.orders.create).not.toHaveBeenCalled();
  });

  test("createStakeOrderService refreshes expired pending stake order", async () => {
    const oldStake = new Date(Date.now() - 60 * 60 * 1000);
    getProductById.mockResolvedValue({
      _id: "p1",
      sellerAcceptedTo: null,
      requests: [
        {
          buyer: { _id: "b1" },
          biddingPrice: 1000,
          sellerStakeStatus: "Pending",
          sellerStakeId: "stake_old_2",
          sellerStakeCreatedAt: oldStake,
        },
      ],
    });

    razorpay.orders.create.mockResolvedValue({
      id: "order_stake_2",
      amount: 20000,
      currency: "INR",
      receipt: "stake_receipt_2",
      notes: { productId: "p1", buyerId: "b1", type: "seller_stake" },
    });
    createStakeOrderDao.mockResolvedValue({ success: true });

    const result = await createStakeOrderService("p1", "b1");

    expect(result.success).toBe(true);
    expect(razorpay.orders.create).toHaveBeenCalled();
    expect(createStakeOrderDao).toHaveBeenCalledWith("p1", "b1", 200, "order_stake_2");
  });

  test("createStakeOrderService maps dao failure reason when stake order save fails", async () => {
    getProductById.mockResolvedValue({
      _id: "p1",
      sellerAcceptedTo: null,
      requests: [
        {
          buyer: { _id: "b1" },
          biddingPrice: 1000,
          sellerStakeStatus: "Pending",
        },
      ],
    });

    razorpay.orders.create.mockResolvedValue({
      id: "order_stake_3",
      amount: 20000,
      currency: "INR",
      receipt: "stake_receipt_3",
      notes: { productId: "p1", buyerId: "b1", type: "seller_stake" },
    });
    createStakeOrderDao.mockResolvedValue({ success: false, reason: "already_sold" });

    const result = await createStakeOrderService("p1", "b1");

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toBe("Product already sold");
  });

  test("shipOrderService forwards payload to dao", async () => {
    shipOrderDao.mockResolvedValue({
      success: true,
      message: "Order shipped successfully",
      order: { _id: "o1", deliveryStatus: "Shipped" },
    });

    const result = await shipOrderService("o1", "s1", "AWB123", "DTDC", {
      expectedDeliveryDate: "2026-04-20",
      trackingUrl: "http://track.example/1",
      notes: "Fragile",
    });

    expect(result.success).toBe(true);
    expect(shipOrderDao).toHaveBeenCalledWith("o1", "s1", "AWB123", "DTDC", {
      expectedDeliveryDate: "2026-04-20",
      trackingUrl: "http://track.example/1",
      notes: "Fragile",
    });
  });

  test("getSellerOrdersService returns dao list", async () => {
    const orders = [{ _id: "o1" }, { _id: "o2" }];
    getSellerOrdersDao.mockResolvedValue(orders);

    const result = await getSellerOrdersService("s1");

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.orders).toEqual(orders);
  });

  test("getSellerOrdersService returns 500 when dao throws", async () => {
    getSellerOrdersDao.mockRejectedValue(new Error("db down"));

    const result = await getSellerOrdersService("s1");

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
  });

  test("analyticsService returns 404 when seller not found", async () => {
    getBuyerById.mockResolvedValue(null);

    const result = await analyticsService("s1");

    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
    expect(result.message).toBe("Seller not found");
  });

  test("analyticsService returns 409 when products cannot be loaded", async () => {
    getBuyerById.mockResolvedValue({ _id: "s1" });
    findProductsForSeller.mockResolvedValue({ success: false });

    const result = await analyticsService("s1");

    expect(result.success).toBe(false);
    expect(result.status).toBe(409);
    expect(result.message).toBe("Could not load products");
  });

  test("analyticsService returns escrow metrics and legacy fields", async () => {
    getBuyerById.mockResolvedValue({ _id: "s1" });
    findProductsForSeller.mockResolvedValue({
      success: true,
      products: [
        { soldTo: "b1", requests: [{ _id: "r1" }, { _id: "r2" }] },
        { soldTo: null, requests: [{ _id: "r3" }] },
        { soldTo: "b2", requests: [] },
      ],
    });

    const payouts = [
      {
        amount: 1200,
        status: "Processed",
        payoutType: "Seller_120_Percent",
        withdrawalRequestId: null,
        productId: { category: "Mobiles" },
      },
      {
        amount: 200,
        status: "Pending",
        payoutType: "Seller_20_Refund",
        withdrawalRequestId: null,
        productId: { category: "Mobiles" },
      },
      {
        amount: 50,
        status: "Pending",
        payoutType: "Buyer_Partial_Refund",
        withdrawalRequestId: null,
        productId: { category: "Books" },
      },
      {
        amount: 100,
        status: "Pending",
        payoutType: "Seller_120_Percent",
        withdrawalRequestId: "w1",
        productId: { category: "Books" },
      },
      {
        amount: 80,
        status: "Failed",
        payoutType: "Seller_Stake_Release",
        withdrawalRequestId: null,
        productId: { category: "Electronics" },
      },
      {
        amount: 300,
        status: "Processed",
        payoutType: "Seller_BuyerPool_Share",
        withdrawalRequestId: "w2",
        productId: { category: "Fashion" },
      },
    ];

    PendingPayouts.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(payouts),
    });

    getSellerWithdrawalsDao.mockResolvedValue([
      { status: "Failed", withdrawnAmount: 125, initiatedAt: new Date("2026-04-20T12:00:00.000Z") },
      { status: "Processed", withdrawnAmount: 500, initiatedAt: new Date("2026-04-19T12:00:00.000Z") },
      { status: "Processing", withdrawnAmount: 250, initiatedAt: new Date("2026-04-18T12:00:00.000Z") },
    ]);

    getSellerOrdersDao.mockResolvedValue([
      { deliveryStatus: "Pending", amount: 100000, timerTriggered48Hour: false },
      { deliveryStatus: "Shipped", amount: 50000, timerTriggered48Hour: false },
      { deliveryStatus: "Delivered", amount: 80000, timerTriggered48Hour: false },
      { deliveryStatus: "Disputed", amount: 30000, timerTriggered48Hour: false },
      { deliveryStatus: "Completed", amount: 20000, timerTriggered48Hour: true },
    ]);

    const result = await analyticsService("s1");

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data.itemsSold).toBe(2);
    expect(result.data.itemsForSale).toBe(1);
    expect(result.data.pendingRequest).toBe(3);
    expect(result.data.earnings).toBe(1500);
    expect(result.data.settlementSummary.settledEarnings).toBe(1500);
    expect(result.data.settlementSummary.pendingEarnings).toBe(100);
    expect(result.data.settlementSummary.failedPayoutAmount).toBe(80);
    expect(result.data.settlementSummary.disputedHoldAmount).toBe(300);
    expect(result.data.settlementSummary.finalizedAvailableBalance).toBe(1200);
    expect(result.data.settlementSummary.totalWithdrawnToDate).toBe(500);
    expect(result.data.settlementSummary.withdrawalsInProcessing).toBe(250);
    expect(result.data.settlementSummary.failedWithdrawalAmount).toBe(125);
    expect(result.data.settlementSummary.lastWithdrawalStatus).toBe("Failed");
    expect(result.data.settlementSummary.escrowHeldAmount).toBe(2600);
    expect(result.data.settlementSummary.escrowReleasableAmount).toBe(1400);
    expect(result.data.settlementSummary.escrowPendingReviewAmount).toBe(800);
    expect(result.data.settlementSummary.escrowUnderDisputeAmount).toBe(300);
    expect(result.data.settlementSummary.escrowReleasedTotal).toBe(1500);
    expect(result.data.settlementSummary.escrowFailedBlockedAmount).toBe(505);
    expect(result.data.settlementSummary.orderStageCounts).toEqual({
      Pending: 1,
      Shipped: 1,
      Delivered: 1,
      Disputed: 1,
      Completed: 1,
    });
    expect(result.data.orderStageCounts).toEqual({
      Pending: 1,
      Shipped: 1,
      Delivered: 1,
      Disputed: 1,
      Completed: 1,
    });
    expect(result.data.revPerCat.Mobiles).toBe(1200);
    expect(result.data.categoryRevenueSettled.Fashion).toBe(300);
    expect(result.data.categoryRevenuePending.Books).toBe(150);
  });

  test("verifyStakeService rejects invalid signature", async () => {
    validateWebhookSignature.mockReturnValue(false);

    const result = await verifyStakeService(
      "p1",
      "b1",
      "order_1|pay_1",
      "order_1",
      "pay_1",
      "sig_1",
      "secret"
    );

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(verifyStakeDao).not.toHaveBeenCalled();
  });

  test("verifyStakeService returns failure when verify dao fails", async () => {
    validateWebhookSignature.mockReturnValue(true);
    verifyStakeDao.mockResolvedValue({ success: false });

    const result = await verifyStakeService(
      "p1",
      "b1",
      "order_1|pay_1",
      "order_1",
      "pay_1",
      "sig_1",
      "secret"
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to verify stake in database");
  });

  test("verifyStakeService returns failure when accept dao fails", async () => {
    validateWebhookSignature.mockReturnValue(true);
    verifyStakeDao.mockResolvedValue({ success: true });
    acceptProductRequestDao.mockResolvedValue({ success: false });

    const result = await verifyStakeService(
      "p1",
      "b1",
      "order_1|pay_1",
      "order_1",
      "pay_1",
      "sig_1",
      "secret"
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe("Stake verified but failed to accept request");
  });

  test("verifyStakeService accepts and sends notification on success", async () => {
    validateWebhookSignature.mockReturnValue(true);
    verifyStakeDao.mockResolvedValue({ success: true });
    acceptProductRequestDao.mockResolvedValue({
      success: true,
      sellerId: "s1",
      productName: "Phone",
    });

    const result = await verifyStakeService(
      "p1",
      "b1",
      "order_1|pay_1",
      "order_1",
      "pay_1",
      "sig_1",
      "secret"
    );

    expect(result.success).toBe(true);
    expect(createRequestAcceptedNotification).toHaveBeenCalledWith("b1", "s1", "p1", "Phone");
  });

  test("addProductService rejects when monthly quota exceeded", async () => {
    getBuyerById.mockResolvedValue({
      _id: "s1",
      subscription: 1,
      usedPosts: 50,
      windowStart: new Date(),
    });

    const req = {
      user: { _id: "s1" },
      body: {
        name: "Phone",
        price: 1000,
        description: "desc",
        zipCode: "500001",
        category: "Mobiles",
        district: "Hyd",
        city: "Hyd",
        state: "TS",
      },
      cloudinary: {
        productImages: [{ url: "http://img/1.jpg" }],
      },
    };

    await expect(addProductService(req)).rejects.toThrow("You exceeded your plan's limit per month");
  });

  test("addProductService resets window when month changed and creates product", async () => {
    getBuyerById.mockResolvedValue({
      _id: "s1",
      subscription: 1,
      usedPosts: 0,
      windowStart: new Date("2020-01-01T00:00:00.000Z"),
    });
    generateProductHFEmbedding.mockResolvedValue({ sentence: "Phone. Category: Mobiles. desc", vector: [0.1, 0.2] });
    createProduct.mockResolvedValue({ _id: "p1", name: "Phone" });

    const req = {
      user: { _id: "s1" },
      body: {
        name: "Phone",
        price: 1000,
        description: "desc",
        zipCode: "500001",
        category: "Mobiles",
        district: "Hyd",
        city: "Hyd",
        state: "TS",
      },
      cloudinary: {
        productImages: [{ url: "http://img/1.jpg" }],
        invoice: { url: "http://inv/1.pdf" },
      },
    };

    const result = await addProductService(req);

    expect(resetUsedPostsDao).toHaveBeenCalledWith("s1");
    expect(createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Phone",
        invoice: "http://inv/1.pdf",
        hf_embeddings: [0.1, 0.2],
      })
    );
    expect(incrementUsedPostsDao).toHaveBeenCalledWith("s1");
    expect(result._id).toBe("p1");
  });

  test("addProductService throws when product images are missing", async () => {
    getBuyerById.mockResolvedValue({
      _id: "s1",
      subscription: 1,
      usedPosts: 0,
      windowStart: new Date(),
    });

    const req = {
      user: { _id: "s1" },
      body: {
        name: "Phone",
        price: 1000,
        description: "desc",
        zipCode: "500001",
        category: "Mobiles",
        district: "Hyd",
        city: "Hyd",
        state: "TS",
      },
      cloudinary: {
        productImages: [],
      },
    };

    await expect(addProductService(req)).rejects.toThrow("At least one product image is required");
  });
});
