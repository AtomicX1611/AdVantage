import {
  fetchComplaintsByCategory,
  resolveComplaintService,
  resolveEscrowComplaintService,
  verifyProduct,
} from "../../src/services/manager.service.js";

import {
  findUnverifiedProducts,
  findUnverifiedProductsByCategory,
  getProductById,
  verifyProductDao,
} from "../../src/daos/products.dao.js";
import { createProductVerifiedNotification } from "../../src/helpers/notification.helper.js";
import {
  getComplaintByIdDao,
  getComplaintsByCategoryDao,
  resolveComplaintDao,
} from "../../src/daos/complaints.dao.js";
import { getOrderByIdMongoDao, getOrderByProductAndBuyerDao } from "../../src/daos/orders.dao.js";
import PendingPayouts from "../../src/models/PendingPayouts.js";

jest.mock("../../src/daos/products.dao.js", () => ({
  verifyProductDao: jest.fn(),
  findUnverifiedProducts: jest.fn(),
  findUnverifiedProductsByCategory: jest.fn(),
  getProductById: jest.fn(),
}));

jest.mock("../../src/helpers/notification.helper.js", () => ({
  createProductVerifiedNotification: jest.fn(),
}));

jest.mock("../../src/daos/complaints.dao.js", () => ({
  getComplaintsByCategoryDao: jest.fn(),
  resolveComplaintDao: jest.fn(),
  getComplaintByIdDao: jest.fn(),
}));

jest.mock("../../src/daos/orders.dao.js", () => ({
  getOrderByIdMongoDao: jest.fn(),
  getOrderByProductAndBuyerDao: jest.fn(),
}));

jest.mock("../../src/models/PendingPayouts.js", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

describe("manager.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("verifyProduct returns 404 when product missing", async () => {
    getProductById.mockResolvedValue(null);

    const result = await verifyProduct("p1", "m1", "Electronics");

    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });

  test("verifyProduct rejects category mismatch", async () => {
    getProductById.mockResolvedValue({ _id: "p1", category: "Mobiles" });

    const result = await verifyProduct("p1", "m1", "Electronics");

    expect(result.success).toBe(false);
    expect(result.status).toBe(403);
  });

  test("verifyProduct verifies and emits notification", async () => {
    getProductById.mockResolvedValue({ _id: "p1", category: "Electronics", seller: { _id: "s1" } });
    verifyProductDao.mockResolvedValue({ success: true, sellerId: "s1", productName: "Phone" });

    const result = await verifyProduct("p1", "m1", "Electronics");

    expect(result.success).toBe(true);
    expect(createProductVerifiedNotification).toHaveBeenCalledWith("s1", "m1", "p1", "Phone");
  });

  test("fetchComplaintsByCategory returns dao data", async () => {
    getComplaintsByCategoryDao.mockResolvedValue([{ _id: "c1" }]);

    const result = await fetchComplaintsByCategory("Electronics");

    expect(result.success).toBe(true);
    expect(result.complaints).toEqual([{ _id: "c1" }]);
  });

  test("resolveComplaintService returns 404 when complaint missing", async () => {
    getComplaintByIdDao.mockResolvedValue(null);

    const result = await resolveComplaintService("c1", "m1", "Electronics", "resolved", "done");

    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });

  test("resolveComplaintService blocks cross-category manager", async () => {
    getComplaintByIdDao.mockResolvedValue({ productId: { category: "Mobiles" } });

    const result = await resolveComplaintService("c1", "m1", "Electronics", "resolved", "done");

    expect(result.success).toBe(false);
    expect(result.status).toBe(403);
  });

  test("resolveComplaintService updates complaint", async () => {
    getComplaintByIdDao.mockResolvedValue({ productId: { category: "Electronics" } });
    resolveComplaintDao.mockResolvedValue({ _id: "c1", status: "resolved" });

    const result = await resolveComplaintService("c1", "m1", "Electronics", "resolved", "done");

    expect(result.success).toBe(true);
    expect(resolveComplaintDao).toHaveBeenCalledWith("c1", "m1", "resolved", "done");
  });

  test("resolveEscrowComplaintService returns 404 when complaint missing", async () => {
    getComplaintByIdDao.mockResolvedValue(null);

    const result = await resolveEscrowComplaintService("c1", "m1", "Electronics", { actionType: "refund_buyer" });

    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });

  test("resolveEscrowComplaintService returns 404 when order not found", async () => {
    getComplaintByIdDao.mockResolvedValue({
      productId: { _id: "p1", category: "Electronics" },
      complainant: "u1",
      orderId: null,
    });
    getOrderByProductAndBuyerDao.mockResolvedValue(null);

    const result = await resolveEscrowComplaintService("c1", "m1", "Electronics", { actionType: "refund_buyer" });

    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });

  test("resolveEscrowComplaintService rejects non-disputed orders", async () => {
    getComplaintByIdDao.mockResolvedValue({
      productId: { _id: "p1", category: "Electronics" },
      complainant: "u1",
      orderId: null,
    });
    getOrderByProductAndBuyerDao.mockResolvedValue({ deliveryStatus: "Delivered" });

    const result = await resolveEscrowComplaintService("c1", "m1", "Electronics", { actionType: "refund_buyer" });

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  test("resolveEscrowComplaintService rejects invalid action type", async () => {
    getComplaintByIdDao.mockResolvedValue({
      productId: { _id: "p1", category: "Electronics" },
      complainant: "u1",
      orderId: null,
    });
    getOrderByProductAndBuyerDao.mockResolvedValue({
      deliveryStatus: "Disputed",
      amount: 100000,
      productId: { _id: "p1", seller: "s1", requests: [] },
      buyerId: "u1",
    });

    const result = await resolveEscrowComplaintService("c1", "m1", "Electronics", { actionType: "bad_action" });

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  test("resolveEscrowComplaintService rejects invalid buyer refund", async () => {
    getComplaintByIdDao.mockResolvedValue({
      productId: { _id: "p1", category: "Electronics" },
      complainant: "u1",
      orderId: null,
    });
    getOrderByProductAndBuyerDao.mockResolvedValue({
      deliveryStatus: "Disputed",
      amount: 100000,
      productId: { _id: "p1", seller: "s1", requests: [] },
      buyerId: "u1",
    });

    const result = await resolveEscrowComplaintService("c1", "m1", "Electronics", {
      actionType: "custom_split",
      buyerRefundAmount: 2000,
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  test("resolveEscrowComplaintService rejects invalid stake release", async () => {
    getComplaintByIdDao.mockResolvedValue({
      productId: { _id: "p1", category: "Electronics" },
      complainant: "u1",
      orderId: null,
    });
    getOrderByProductAndBuyerDao.mockResolvedValue({
      _id: "o1",
      deliveryStatus: "Disputed",
      amount: 100000,
      buyerId: "u1",
      productId: {
        _id: "p1",
        seller: "s1",
        requests: [{ buyer: { toString: () => "u1" }, sellerStakeAmount: 200 }],
      },
    });

    const result = await resolveEscrowComplaintService("c1", "m1", "Electronics", {
      actionType: "refund_buyer",
      sellerStakeReleaseAmount: 300,
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  test("resolveEscrowComplaintService creates payout entries and updates order on success", async () => {
    const productSave = jest.fn().mockResolvedValue(true);
    const orderSave = jest.fn().mockResolvedValue(true);

    getComplaintByIdDao.mockResolvedValue({
      productId: { _id: "p1", category: "Electronics" },
      complainant: "u1",
      orderId: null,
    });

    getOrderByProductAndBuyerDao.mockResolvedValue({
      _id: "o1",
      deliveryStatus: "Disputed",
      amount: 100000,
      buyerId: { toString: () => "u1" },
      productId: {
        _id: "p1",
        seller: "s1",
        requests: [{ buyer: { toString: () => "u1" }, sellerStakeAmount: 200 }],
        save: productSave,
      },
      save: orderSave,
    });

    resolveComplaintDao.mockResolvedValue({ _id: "c1", status: "resolved" });

    const result = await resolveEscrowComplaintService("c1", "m1", "Electronics", {
      actionType: "custom_split",
      buyerRefundAmount: 300,
      sellerStakeReleaseAmount: 200,
      resolution: "custom settlement",
    });

    expect(result.success).toBe(true);
    expect(PendingPayouts.create).toHaveBeenCalledTimes(3);
    expect(orderSave).toHaveBeenCalled();
    expect(productSave).toHaveBeenCalled();
    expect(resolveComplaintDao).toHaveBeenCalled();
  });
});
