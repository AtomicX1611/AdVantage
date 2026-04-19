import {
  adminLogin,
  buyerSignup,
  managerLogin,
  verifyEmailController,
} from "../../src/controllers/auth.controller.js";

import {
  adminLoginService,
  managerLoginService,
  signupBuyerService,
  verifyEmailService,
} from "../../src/services/auth.service.js";

jest.mock("../../src/services/auth.service.js", () => ({
  signupBuyerService: jest.fn(),
  buyerLoginService: jest.fn(),
  adminLoginService: jest.fn(),
  managerLoginService: jest.fn(),
  getMyInfoService: jest.fn(),
  googleSignInService: jest.fn(),
  verifyEmailService: jest.fn(),
}));

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.cookie = jest.fn(() => res);
  res.clearCookie = jest.fn(() => res);
  return res;
}

describe("auth.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("buyerSignup returns 400 when required fields are missing", async () => {
    const req = { body: { email: "a@test.com" } };
    const res = mockRes();

    await buyerSignup(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("buyerSignup returns 201 when signup succeeds", async () => {
    const req = {
      body: {
        username: "u1",
        contact: "9999999999",
        email: "u@test.com",
        password: "pass",
      },
    };
    const res = mockRes();

    signupBuyerService.mockResolvedValue({ success: true, status: 201 });

    await buyerSignup(req, res, jest.fn());

    expect(signupBuyerService).toHaveBeenCalledWith(
      "u1",
      "9999999999",
      "u@test.com",
      "pass"
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("adminLogin returns 400 when credentials are missing", async () => {
    const req = { body: { email: "" } };
    const res = mockRes();

    await adminLogin(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("adminLogin returns 200 and sets cookie on success", async () => {
    const req = { body: { email: "admin@test.com", password: "pass" } };
    const res = mockRes();

    adminLoginService.mockResolvedValue({
      success: true,
      token: "token-1",
      admin: { _id: "a1", email: "admin@test.com" },
    });

    await adminLogin(req, res, jest.fn());

    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "token-1",
      expect.objectContaining({ httpOnly: true })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("managerLogin maps service error response", async () => {
    const req = { body: { email: "manager@test.com", password: "bad" } };
    const res = mockRes();

    managerLoginService.mockResolvedValue({
      success: false,
      status: 401,
      message: "email or password is incorrect",
    });

    await managerLogin(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("verifyEmailController returns 400 when body is incomplete", async () => {
    const req = { body: { email: "u@test.com" } };
    const res = mockRes();

    await verifyEmailController(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("verifyEmailController sets cookie and returns payload on success", async () => {
    const req = { body: { email: "u@test.com", code: "123456" } };
    const res = mockRes();

    verifyEmailService.mockResolvedValue({
      success: true,
      status: 200,
      message: "Email verified successfully",
      token: "token-2",
      email: "u@test.com",
      buyerId: "u1",
    });

    await verifyEmailController(req, res, jest.fn());

    expect(verifyEmailService).toHaveBeenCalledWith("u@test.com", "123456");
    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "token-2",
      expect.objectContaining({ httpOnly: true })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
