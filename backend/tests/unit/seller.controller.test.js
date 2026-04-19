import { analyticsController } from "../../src/controllers/seller.controller.js";
import { analyticsService } from "../../src/services/seller.service.js";

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

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("seller.controller analyticsController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 404 when userId is missing", async () => {
    const req = { user: {} };
    const res = mockRes();
    const next = jest.fn();

    await analyticsController(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "userId not found",
    });
    expect(analyticsService).not.toHaveBeenCalled();
  });

  test("returns service payload on success", async () => {
    const req = { user: { _id: "seller_1" } };
    const res = mockRes();
    const next = jest.fn();

    analyticsService.mockResolvedValue({
      status: 200,
      success: true,
      message: "Analytics found",
      data: {
        earnings: 1500,
        settlementSummary: {
          escrowHeldAmount: 2600,
        },
      },
    });

    await analyticsController(req, res, next);

    expect(analyticsService).toHaveBeenCalledWith("seller_1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Analytics found",
      success: true,
      data: {
        earnings: 1500,
        settlementSummary: {
          escrowHeldAmount: 2600,
        },
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("forwards service status and failure payload", async () => {
    const req = { user: { _id: "seller_1" } };
    const res = mockRes();
    const next = jest.fn();

    analyticsService.mockResolvedValue({
      status: 409,
      success: false,
      message: "Could not load products",
      data: undefined,
    });

    await analyticsController(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Could not load products",
      success: false,
      data: undefined,
    });
  });

  test("passes thrown errors to next", async () => {
    const req = { user: { _id: "seller_1" } };
    const res = mockRes();
    const next = jest.fn();
    const error = new Error("boom");

    analyticsService.mockRejectedValue(error);

    await analyticsController(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
