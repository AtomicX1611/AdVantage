import {
  acceptProductRequestService,
  rejectProductRequestService,
  revokeAcceptedRequestService,
} from "../../src/services/seller.service.js";

import {
  acceptProductRequestDao,
  rejectProductRequestDao,
  revokeAcceptedRequestDao,
} from "../../src/daos/products.dao.js";

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
  findProductsForSeller: jest.fn(),
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
});
