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
  acceptProductRequestService,
  createStakeOrderService,
  getSellerOrdersService,
  rejectProductRequestService,
  revokeAcceptedRequestService,
  sellerCancelPaidOrderService,
  shipOrderService,
} from "../../src/services/seller.service.js";

import {
  acceptProductRequestDao,
  createStakeOrderDao,
  getProductById,
  rejectProductRequestDao,
  revokeAcceptedRequestDao,
} from "../../src/daos/products.dao.js";
import { razorpay } from "../../src/config/payment.config.js";
import { sellerCancelPaidOrderDao } from "../../src/daos/orders.dao.js";
import { getSellerOrdersDao, shipOrderDao } from "../../src/daos/orders.dao.js";

import {
  createRequestAcceptedNotification,
  createRequestRejectedNotification,
  createRequestRevokedNotification,
} from "../../src/helpers/notification.helper.js";

jest.mock("../../src/daos/products.dao.js", () => ({
  createProduct: jest.fn(),
  getProductById: jest.fn(),
  deleteProductDao: jest.fn(),
  acceptProductRequestDao: jest.fn(),
  rejectProductRequestDao: jest.fn(),
  makeAvailableDao: jest.fn(),
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
  generateProductOllamaEmbedding: jest.fn(),
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
});
