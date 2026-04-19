import express from "express";
import request from "supertest";

jest.mock("../../src/services/seller.service.js", () => ({
  setupSellerPayoutAccountService: jest.fn(),
  getSellerPayoutAccountService: jest.fn(),
  withdrawFinalizedBalanceService: jest.fn(),
  getTransactionsService: jest.fn(),
}));

import {
  createPayoutAccountController,
  getPayoutAccountController,
  withdrawFinalizedBalanceController,
  getTransactionsController,
} from "../../src/controllers/seller.controller.js";
import { validatePayoutAccountPayload, validateWithdrawPayload } from "../../src/middlewares/payout.middleware.js";
import {
  setupSellerPayoutAccountService,
  getSellerPayoutAccountService,
  withdrawFinalizedBalanceService,
  getTransactionsService,
} from "../../src/services/seller.service.js";

describe("payout routes integration", () => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.user = { _id: "user_1", role: "user" };
    next();
  });

  app.post("/user/payout-account", validatePayoutAccountPayload, createPayoutAccountController);
  app.get("/user/payout-account", getPayoutAccountController);
  app.post("/user/withdraw-finalized-balance", validateWithdrawPayload, withdrawFinalizedBalanceController);
  app.get("/user/getMyTransactions", getTransactionsController);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /user/payout-account blocks invalid IFSC", async () => {
    const res = await request(app).post("/user/payout-account").send({
      accountType: "bank",
      holderName: "User One",
      accountNumber: "123456789012",
      ifsc: "BADIFSC1",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(setupSellerPayoutAccountService).not.toHaveBeenCalled();
  });

  test("POST /user/payout-account accepts valid UPI payload and calls controller service", async () => {
    setupSellerPayoutAccountService.mockResolvedValue({
      success: true,
      status: 201,
      payoutAccount: { id: "acct_1", accountType: "upi", upiId: "user@oksbi" },
    });

    const res = await request(app).post("/user/payout-account").send({
      accountType: "upi",
      holderName: "User One",
      upiId: "user@oksbi",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(setupSellerPayoutAccountService).toHaveBeenCalledWith(
      "user_1",
      expect.objectContaining({ accountType: "upi", upiId: "user@oksbi" })
    );
  });

  test("GET /user/payout-account returns account payload", async () => {
    getSellerPayoutAccountService.mockResolvedValue({
      success: true,
      status: 200,
      payoutAccount: {
        id: "acct_1",
        accountType: "bank",
        accountNumberMasked: "*****6789",
        ifsc: "HDFC0123456",
      },
    });

    const res = await request(app).get("/user/payout-account");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.payoutAccount.accountType).toBe("bank");
    expect(getSellerPayoutAccountService).toHaveBeenCalledWith("user_1");
  });

  test("POST /user/withdraw-finalized-balance blocks invalid transfer mode", async () => {
    const res = await request(app).post("/user/withdraw-finalized-balance").send({ transferMode: "CARD" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(withdrawFinalizedBalanceService).not.toHaveBeenCalled();
  });

  test("POST /user/withdraw-finalized-balance returns service response", async () => {
    withdrawFinalizedBalanceService.mockResolvedValue({
      success: true,
      status: 200,
      data: {
        withdrawalId: "wd_1",
        amount: 350,
        externalPayoutId: "pout_1",
      },
    });

    const res = await request(app)
      .post("/user/withdraw-finalized-balance")
      .send({ transferMode: "IMPS" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(350);
    expect(withdrawFinalizedBalanceService).toHaveBeenCalledWith("user_1", "IMPS");
  });

  test("GET /user/getMyTransactions returns fallback summary shape", async () => {
    getTransactionsService.mockResolvedValue({
      success: true,
      status: 200,
      paymentLedger: [],
      payoutLedger: [],
      withdrawalLedger: [],
      summary: {
        grossBuyerPayments: 0,
        settledEarnings: 0,
        pendingEarnings: 0,
        availableToWithdraw: 0,
        withdrawnToDate: 0,
        inProgressWithdrawals: 0,
        failedWithdrawals: 0,
      },
    });

    const res = await request(app).get("/user/getMyTransactions");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.summary.availableToWithdraw).toBe(0);
    expect(getTransactionsService).toHaveBeenCalledWith("user_1");
  });
});
