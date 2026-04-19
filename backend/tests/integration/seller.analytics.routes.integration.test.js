import express from "express";
import request from "supertest";

jest.mock("../../src/services/seller.service.js", () => ({
  addProductService: jest.fn(),
  acceptProductRequestService: jest.fn(),
  rejectProductRequestService: jest.fn(),
  createStakeOrderService: jest.fn(),
  verifyStakeService: jest.fn(),
  shipOrderService: jest.fn(),
  verifyDeliveryService: jest.fn(),
  getSellerOrdersService: jest.fn(),
  sellerCancelPaidOrderService: jest.fn(),
  updateSellerSubscriptionService: jest.fn(),
  sellerProdRetriveService: jest.fn(),
  sellerSubsRetService: jest.fn(),
  deleteProductService: jest.fn(),
  revokeAcceptedRequestService: jest.fn(),
  analyticsService: jest.fn(),
  getTransactionsService: jest.fn(),
  setupSellerPayoutAccountService: jest.fn(),
  getSellerPayoutAccountService: jest.fn(),
  withdrawFinalizedBalanceService: jest.fn(),
}));

import { analyticsController } from "../../src/controllers/seller.controller.js";
import { analyticsService } from "../../src/services/seller.service.js";

describe("seller analytics routes integration", () => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.user = { _id: "seller_1", role: "user" };
    next();
  });
  app.get("/user/selling-analytics", analyticsController);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /user/selling-analytics returns legacy and escrow fields", async () => {
    analyticsService.mockResolvedValue({
      status: 200,
      success: true,
      message: "Analytics found",
      data: {
        earnings: 1500,
        pendingRequest: 3,
        itemsForSale: 1,
        itemsSold: 2,
        revPerCat: { Mobiles: 1200 },
        categoryRevenueSettled: { Mobiles: 1200 },
        categoryRevenuePending: { Books: 150 },
        settlementSummary: {
          settledEarnings: 1500,
          escrowHeldAmount: 2600,
          escrowReleasableAmount: 1400,
          escrowPendingReviewAmount: 800,
          escrowUnderDisputeAmount: 300,
          escrowReleasedTotal: 1500,
          escrowFailedBlockedAmount: 505,
          orderStageCounts: {
            Pending: 1,
            Shipped: 1,
            Delivered: 1,
            Disputed: 1,
            Completed: 1,
          },
        },
        orderStageCounts: {
          Pending: 1,
          Shipped: 1,
          Delivered: 1,
          Disputed: 1,
          Completed: 1,
        },
      },
    });

    const res = await request(app).get("/user/selling-analytics");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.earnings).toBe(1500);
    expect(res.body.data.settlementSummary.escrowHeldAmount).toBe(2600);
    expect(res.body.data.orderStageCounts.Disputed).toBe(1);
    expect(res.body.data.settlementSummary.orderStageCounts.Completed).toBe(1);
    expect(analyticsService).toHaveBeenCalledWith("seller_1");
  });

  test("GET /user/selling-analytics forwards service failure response", async () => {
    analyticsService.mockResolvedValue({
      status: 500,
      success: false,
      message: "Internal server err",
    });

    const res = await request(app).get("/user/selling-analytics");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Internal server err");
  });

  test("GET /user/selling-analytics returns 404 when user is missing", async () => {
    const appMissingUser = express();
    appMissingUser.use(express.json());
    appMissingUser.use((req, _res, next) => {
      req.user = {};
      next();
    });
    appMissingUser.get("/user/selling-analytics", analyticsController);

    const res = await request(appMissingUser).get("/user/selling-analytics");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("userId not found");
  });
});
