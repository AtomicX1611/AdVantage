process.env.RAZORPAYKEYID = "test_key_id";
process.env.RAZORPAYKEYSECRET = "test_key_secret";

import mongoose from "mongoose";

jest.mock("../../src/config/payment.config.js", () => ({
  razorpay: {
    orders: {
      create: jest.fn(),
    },
    payments: {
      fetch: jest.fn(),
    },
  },
}));

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

jest.mock("../../src/models/PendingPayouts.js", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock("../../src/models/Orders.js", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
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

jest.mock("../../src/services/payout.service.js", () => ({
  createImmediateSellerPayout: jest.fn(),
  createSellerFundAccount: jest.fn(),
}));

import {
  setupSellerPayoutAccountService,
  getSellerPayoutAccountService,
  withdrawFinalizedBalanceService,
  getTransactionsService,
} from "../../src/services/seller.service.js";

import PendingPayouts from "../../src/models/PendingPayouts.js";
import Order from "../../src/models/Orders.js";
import { getBuyerById } from "../../src/daos/users.dao.js";
import {
  createPayoutAccountDao,
  createSellerWithdrawalDao,
  getActivePayoutAccountBySellerDao,
  getProcessingWithdrawalBySellerDao,
  getSellerWithdrawalsDao,
  getWithdrawablePayoutsDao,
  markPayoutsAsLinkedToWithdrawalDao,
  markWithdrawalPayoutExecutionDao,
  unlinkPayoutsFromWithdrawalDao,
  updateSellerWithdrawalDao,
} from "../../src/daos/payout.dao.js";
import { createImmediateSellerPayout, createSellerFundAccount } from "../../src/services/payout.service.js";
import { getPaymentsByFrom, getPaymentsByTo } from "../../src/daos/payment.dao.js";

describe("seller payout service", () => {
  let session;

  beforeEach(() => {
    jest.clearAllMocks();
    session = {
      withTransaction: jest.fn(async (fn) => fn()),
      endSession: jest.fn(),
    };
    jest.spyOn(mongoose, "startSession").mockResolvedValue(session);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("setupSellerPayoutAccountService returns 404 when user not found", async () => {
    getBuyerById.mockResolvedValue(null);

    const result = await setupSellerPayoutAccountService("u1", {
      accountType: "bank",
      holderName: "User One",
      accountNumber: "123456789",
      ifsc: "HDFC0123456",
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });

  test("setupSellerPayoutAccountService rejects duplicate active account", async () => {
    getBuyerById.mockResolvedValue({ _id: "u1" });
    getActivePayoutAccountBySellerDao.mockResolvedValue({ _id: "existing" });

    const result = await setupSellerPayoutAccountService("u1", {
      accountType: "upi",
      holderName: "User One",
      upiId: "user@oksbi",
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe(409);
  });

  test("setupSellerPayoutAccountService creates bank account and masks account number", async () => {
    const updateOne = jest.fn().mockResolvedValue({ acknowledged: true });
    getBuyerById.mockResolvedValue({ _id: "u1", updateOne });
    getActivePayoutAccountBySellerDao.mockResolvedValue(null);
    createSellerFundAccount.mockResolvedValue({ contactId: "cont_1", fundAccountId: "fa_1" });
    createPayoutAccountDao.mockResolvedValue({
      _id: "acct_1",
      accountType: "bank",
      holderName: "User One",
      accountNumberMasked: "*****6789",
      ifsc: "HDFC0123456",
      upiId: null,
      verificationStatus: "Verified",
    });

    const result = await setupSellerPayoutAccountService("u1", {
      accountType: "bank",
      holderName: "User One",
      accountNumber: "123456789",
      ifsc: "hdfc0123456",
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe(201);
    expect(createSellerFundAccount).toHaveBeenCalledWith(
      expect.objectContaining({ accountType: "bank", ifsc: "HDFC0123456" })
    );
    expect(createPayoutAccountDao).toHaveBeenCalledWith(
      expect.objectContaining({
        sellerId: "u1",
        accountType: "bank",
        accountNumberMasked: "*****6789",
      })
    );
    expect(updateOne).toHaveBeenCalled();
  });

  test("setupSellerPayoutAccountService maps payout provider error", async () => {
    getBuyerById.mockResolvedValue({ _id: "u1" });
    getActivePayoutAccountBySellerDao.mockResolvedValue(null);
    createSellerFundAccount.mockRejectedValue({ error: { description: "Fund account failed" } });

    const result = await setupSellerPayoutAccountService("u1", {
      accountType: "upi",
      holderName: "User Two",
      upiId: "user.two@okhdfcbank",
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.message).toBe("Fund account failed");
  });

  test("getSellerPayoutAccountService returns null payload when no active account", async () => {
    getActivePayoutAccountBySellerDao.mockResolvedValue(null);

    const result = await getSellerPayoutAccountService("u1");

    expect(result.success).toBe(true);
    expect(result.payoutAccount).toBeNull();
  });

  test("getSellerPayoutAccountService maps account fields", async () => {
    getActivePayoutAccountBySellerDao.mockResolvedValue({
      _id: "acct_1",
      accountType: "upi",
      holderName: "User One",
      accountNumberMasked: null,
      ifsc: null,
      upiId: "user@oksbi",
      verificationStatus: "Verified",
    });

    const result = await getSellerPayoutAccountService("u1");

    expect(result.success).toBe(true);
    expect(result.payoutAccount).toEqual(
      expect.objectContaining({ accountType: "upi", upiId: "user@oksbi" })
    );
  });

  test("withdrawFinalizedBalanceService rejects when payout account missing", async () => {
    getActivePayoutAccountBySellerDao.mockResolvedValue(null);

    const result = await withdrawFinalizedBalanceService("u1", "IMPS");

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toBe("Payout account not configured");
    expect(session.endSession).toHaveBeenCalled();
  });

  test("withdrawFinalizedBalanceService rejects when processing withdrawal exists", async () => {
    getActivePayoutAccountBySellerDao.mockResolvedValue({ _id: "acct_1" });
    getProcessingWithdrawalBySellerDao.mockResolvedValue({ _id: "w_processing" });

    const result = await withdrawFinalizedBalanceService("u1", "IMPS");

    expect(result.success).toBe(false);
    expect(result.status).toBe(409);
    expect(result.message).toBe("A withdrawal is already in progress");
  });

  test("withdrawFinalizedBalanceService returns 400 when no withdrawable balance", async () => {
    getActivePayoutAccountBySellerDao.mockResolvedValue({
      _id: "acct_1",
      accountType: "bank",
      razorpayFundAccountId: "fa_1",
    });
    getProcessingWithdrawalBySellerDao.mockResolvedValue(null);
    getWithdrawablePayoutsDao.mockResolvedValue([]);

    const result = await withdrawFinalizedBalanceService("u1", "IMPS");

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toBe("No finalized balance is available to withdraw");
    expect(createImmediateSellerPayout).not.toHaveBeenCalled();
  });

  test("withdrawFinalizedBalanceService processes successful withdrawal", async () => {
    getActivePayoutAccountBySellerDao.mockResolvedValue({
      _id: "acct_1",
      accountType: "bank",
      razorpayFundAccountId: "fa_1",
    });
    getProcessingWithdrawalBySellerDao.mockResolvedValue(null);
    getWithdrawablePayoutsDao.mockResolvedValue([
      { _id: "p1", amount: 300, payoutType: "Seller_120_Percent", status: "Pending" },
      { _id: "p2", amount: 200, payoutType: "Buyer_100_Refund", status: "Processed" },
    ]);
    createSellerWithdrawalDao.mockImplementation(async (payload) => ({
      _id: "w1",
      ...payload,
    }));
    createImmediateSellerPayout.mockResolvedValue({
      id: "pout_1",
      mode: "IMPS",
      status: "processed",
    });

    const result = await withdrawFinalizedBalanceService("u1", "IMPS");

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data.amount).toBe(500);
    expect(getWithdrawablePayoutsDao).toHaveBeenCalledWith(
      "u1",
      expect.arrayContaining(["Buyer_100_Refund", "Seller_120_Percent"]),
      session
    );
    expect(markPayoutsAsLinkedToWithdrawalDao).toHaveBeenCalled();
    expect(markWithdrawalPayoutExecutionDao).toHaveBeenCalledWith(
      expect.objectContaining({ payoutId: "pout_1", transferMode: "IMPS" })
    );
    expect(updateSellerWithdrawalDao).toHaveBeenCalledWith(
      "w1",
      expect.objectContaining({ status: "Processed", externalPayoutId: "pout_1" })
    );
  });

  test("withdrawFinalizedBalanceService recovers from payout provider failure", async () => {
    getActivePayoutAccountBySellerDao.mockResolvedValue({
      _id: "acct_1",
      accountType: "bank",
      razorpayFundAccountId: "fa_1",
    });
    getProcessingWithdrawalBySellerDao.mockResolvedValue(null);
    getWithdrawablePayoutsDao.mockResolvedValue([
      { _id: "p1", amount: 300, payoutType: "Seller_120_Percent", status: "Pending" },
    ]);
    createSellerWithdrawalDao.mockImplementation(async (payload) => ({ _id: "w1", ...payload }));
    createImmediateSellerPayout.mockRejectedValue({ error: { description: "Razorpay transfer failed", code: "BAD_REQUEST" } });

    const result = await withdrawFinalizedBalanceService("u1", "IMPS");

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.message).toBe("Razorpay transfer failed");
    expect(updateSellerWithdrawalDao).toHaveBeenCalledWith(
      "w1",
      expect.objectContaining({ status: "Failed", failureReason: "Razorpay transfer failed" })
    );
    expect(unlinkPayoutsFromWithdrawalDao).toHaveBeenCalledWith(
      ["p1"],
      "Razorpay transfer failed"
    );
    expect(markWithdrawalPayoutExecutionDao).toHaveBeenCalledWith(
      expect.objectContaining({ payoutIds: ["p1"], failureCode: "BAD_REQUEST" })
    );
  });

  test("withdrawFinalizedBalanceService maps razorpay source-account config error to 400", async () => {
    getActivePayoutAccountBySellerDao.mockResolvedValue({
      _id: "acct_1",
      accountType: "upi",
      razorpayFundAccountId: "fa_1",
    });
    getProcessingWithdrawalBySellerDao.mockResolvedValue(null);
    getWithdrawablePayoutsDao.mockResolvedValue([
      { _id: "p1", amount: 100, payoutType: "Buyer_Partial_Refund", status: "Pending" },
    ]);
    createSellerWithdrawalDao.mockImplementation(async (payload) => ({ _id: "w1", ...payload }));
    createImmediateSellerPayout.mockRejectedValue(new Error("RazorpayX source account number is missing. Set RAZORPAY_X_ACCOUNT_NUMBER"));

    const result = await withdrawFinalizedBalanceService("u1", "UPI");

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  test("getTransactionsService returns summary with buyer and seller payout types", async () => {
    getPaymentsByTo.mockResolvedValue([
      {
        _id: "pay_in_1",
        paymentType: "purchase",
        relatedEntityType: "Products",
        relatedEntityId: "prod_1",
        from: { _id: "buyer_1", username: "Buyer One" },
        date: new Date("2026-04-10"),
        price: 700,
      },
    ]);
    getPaymentsByFrom.mockResolvedValue([
      {
        _id: "pay_out_1",
        paymentType: "subscription",
        to: { username: "Platform" },
        date: new Date("2026-04-09"),
        price: 100,
      },
    ]);
    getSellerWithdrawalsDao.mockResolvedValue([
      {
        _id: "wd_1",
        status: "Processed",
        withdrawnAmount: 200,
        initiatedAt: new Date("2026-04-11"),
        payoutAccountId: { accountType: "upi", upiId: "user@oksbi" },
        failureReason: null,
      },
    ]);

    const payouts = [
      {
        _id: "po_1",
        payoutType: "Seller_120_Percent",
        status: "Processed",
        withdrawalRequestId: null,
        amount: 300,
        createdAt: new Date("2026-04-08"),
        orderId: "order_1",
        productId: { name: "Phone" },
        reason: "seller settlement",
      },
      {
        _id: "po_2",
        payoutType: "Buyer_100_Refund",
        status: "Pending",
        withdrawalRequestId: null,
        amount: 200,
        createdAt: new Date("2026-04-08"),
        orderId: "order_1",
        productId: { name: "Phone" },
        reason: "buyer refund",
      },
    ];

    PendingPayouts.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(payouts),
    });

    Order.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        {
          _id: "order_1",
          productId: { toString: () => "prod_1" },
          buyerId: { toString: () => "buyer_1" },
          deliveryStatus: "Completed",
          status: "paid",
          timerTriggered48Hour: false,
        },
      ]),
    });

    const result = await getTransactionsService("u1");

    expect(result.success).toBe(true);
    expect(result.payoutLedger).toHaveLength(2);
    expect(result.summary.availableToWithdraw).toBe(500);
    expect(result.summary.withdrawnToDate).toBe(200);
    expect(result.summary.grossBuyerPayments).toBe(700);
  });

  test("getTransactionsService handles empty datasets", async () => {
    getPaymentsByTo.mockResolvedValue([]);
    getPaymentsByFrom.mockResolvedValue([]);
    getSellerWithdrawalsDao.mockResolvedValue([]);
    PendingPayouts.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    const result = await getTransactionsService("u1");

    expect(result.success).toBe(true);
    expect(result.paymentLedger).toEqual([]);
    expect(result.payoutLedger).toEqual([]);
    expect(result.withdrawalLedger).toEqual([]);
    expect(result.summary.availableToWithdraw).toBe(0);
  });
});
