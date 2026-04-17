import {
  createOrder,
  verifyPayment,
} from "../../src/controllers/buyer.controller.js";

import {
  createOrderService,
  verifyPaymentService,
} from "../../src/services/buyer.service.js";

jest.mock("../../src/services/buyer.service.js", () => ({
  updateBuyerProfileService: jest.fn(),
  addToWishlistService: jest.fn(),
  removeFromWishlistService: jest.fn(),
  requestProductService: jest.fn(),
  updateBuyerPasswordService: jest.fn(),
  getWishlistProductsService: jest.fn(),
  getYourProductsService: jest.fn(),
  rentService: jest.fn(),
  getYouProfileService: jest.fn(),
  paymentDoneService: jest.fn(),
  notInterestedService: jest.fn(),
  getPendingRequestsService: jest.fn(),
  getYourNotificationsService: jest.fn(),
  markNotificationAsReadService: jest.fn(),
  markAllNotificationsAsReadService: jest.fn(),
  deleteNotificationService: jest.fn(),
  createOrderService: jest.fn(),
  verifyPaymentService: jest.fn(),
}));

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("buyer.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createOrder returns 400 for invalid request", async () => {
    const req = { user: { _id: "u1" }, body: { productId: "p1", subscription: 1 } };
    const res = mockRes();

    await createOrder(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createOrder returns 201 on success", async () => {
    const req = { user: { _id: "u1" }, body: { productId: "p1" } };
    const res = mockRes();

    createOrderService.mockResolvedValue({ success: true, message: "ok", order: { id: "o1" } });

    await createOrder(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("verifyPayment returns 400 for missing fields", async () => {
    const req = { body: { razorpay_order_id: "o1" } };
    const res = mockRes();

    await verifyPayment(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("verifyPayment returns 200 on success", async () => {
    const req = {
      body: {
        razorpay_order_id: "o1",
        razorpay_payment_id: "p1",
        razorpay_signature: "sig",
      },
    };
    const res = mockRes();

    verifyPaymentService.mockResolvedValue({ success: true, message: "verified" });

    await verifyPayment(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(verifyPaymentService).toHaveBeenCalled();
  });
});
