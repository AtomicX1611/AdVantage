import { validatePayoutAccountPayload, validateWithdrawPayload } from "../../src/middlewares/payout.middleware.js";

function createRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("payout.middleware", () => {
  test("validatePayoutAccountPayload accepts valid bank payload", () => {
    const req = {
      body: {
        accountType: "bank",
        holderName: "Buyer One",
        accountNumber: "123456789012",
        ifsc: "HDFC0123456",
      },
    };
    const res = createRes();
    const next = jest.fn();

    validatePayoutAccountPayload(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("validatePayoutAccountPayload accepts lowercase IFSC by normalizing", () => {
    const req = {
      body: {
        accountType: "bank",
        holderName: "Buyer Two",
        accountNumber: "123456789",
        ifsc: "hdfc0123456",
      },
    };
    const res = createRes();
    const next = jest.fn();

    validatePayoutAccountPayload(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test("validatePayoutAccountPayload rejects invalid account type", () => {
    const req = { body: { accountType: "wallet", holderName: "X" } };
    const res = createRes();
    const next = jest.fn();

    validatePayoutAccountPayload(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "accountType must be either bank or upi" });
  });

  test("validatePayoutAccountPayload rejects short holder name", () => {
    const req = { body: { accountType: "upi", holderName: "A", upiId: "abc@okhdfcbank" } };
    const res = createRes();
    const next = jest.fn();

    validatePayoutAccountPayload(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Valid holderName is required" });
  });

  test("validatePayoutAccountPayload rejects invalid bank account number", () => {
    const req = {
      body: {
        accountType: "bank",
        holderName: "Buyer Three",
        accountNumber: "12345",
        ifsc: "HDFC0123456",
      },
    };
    const res = createRes();
    const next = jest.fn();

    validatePayoutAccountPayload(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "accountNumber must be 9 to 18 digits" });
  });

  test("validatePayoutAccountPayload rejects invalid IFSC", () => {
    const req = {
      body: {
        accountType: "bank",
        holderName: "Buyer Four",
        accountNumber: "123456789012",
        ifsc: "INVALID123",
      },
    };
    const res = createRes();
    const next = jest.fn();

    validatePayoutAccountPayload(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid IFSC format" });
  });

  test("validatePayoutAccountPayload accepts valid UPI payload", () => {
    const req = {
      body: {
        accountType: "upi",
        holderName: "Buyer Five",
        upiId: "buyer.name@oksbi",
      },
    };
    const res = createRes();
    const next = jest.fn();

    validatePayoutAccountPayload(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("validatePayoutAccountPayload rejects invalid UPI", () => {
    const req = {
      body: {
        accountType: "upi",
        holderName: "Buyer Six",
        upiId: "bad-upi-format",
      },
    };
    const res = createRes();
    const next = jest.fn();

    validatePayoutAccountPayload(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid UPI ID format" });
  });

  test("validateWithdrawPayload accepts empty payload", () => {
    const req = { body: {} };
    const res = createRes();
    const next = jest.fn();

    validateWithdrawPayload(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("validateWithdrawPayload accepts valid transfer mode", () => {
    const req = { body: { transferMode: "IMPS" } };
    const res = createRes();
    const next = jest.fn();

    validateWithdrawPayload(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test("validateWithdrawPayload rejects invalid transfer mode", () => {
    const req = { body: { transferMode: "CARD" } };
    const res = createRes();
    const next = jest.fn();

    validateWithdrawPayload(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid transferMode" });
  });
});
