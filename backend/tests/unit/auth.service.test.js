import {
  MailService,
  adminLoginService,
  buyerLoginService,
  managerLoginService,
  verifyEmailService,
  getMyInfoService,
} from "../../src/services/auth.service.js";

import { findBuyerByEmail, getBuyerById, createBuyer } from "../../src/daos/users.dao.js";
import { findAdminByEmail, getAdminById } from "../../src/daos/admins.dao.js";
import { findManagerByEmail, getManagerById } from "../../src/daos/managers.dao.js";
import { findPendingUserByEmail, deletePendingUser } from "../../src/daos/pendingUser.dao.js";
import nodemailer from "nodemailer";

jest.mock("../../src/daos/users.dao.js", () => ({
  getBuyerById: jest.fn(),
  createBuyer: jest.fn(),
  findBuyerByEmail: jest.fn(),
}));

jest.mock("../../src/daos/pendingUser.dao.js", () => ({
  createPendingUser: jest.fn(),
  deletePendingUser: jest.fn(),
  findPendingUserByEmail: jest.fn(),
}));

jest.mock("../../src/daos/admins.dao.js", () => ({
  findAdminByEmail: jest.fn(),
  getAdminById: jest.fn(),
}));

jest.mock("../../src/daos/managers.dao.js", () => ({
  findManagerByEmail: jest.fn(),
  getManagerById: jest.fn(),
}));

jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue(true),
  })),
}));

describe("auth.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "unit-test-secret";
  });

  test("buyerLoginService returns 404 when buyer missing", async () => {
    findBuyerByEmail.mockResolvedValue(null);

    const result = await buyerLoginService("no@user.com", "pass");

    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });

  test("buyerLoginService returns 401 for wrong password", async () => {
    findBuyerByEmail.mockResolvedValue({ _id: "u1", password: "right" });

    const result = await buyerLoginService("u@test.com", "wrong");

    expect(result.success).toBe(false);
    expect(result.status).toBe(401);
  });

  test("buyerLoginService returns token on success", async () => {
    findBuyerByEmail.mockResolvedValue({ _id: "u1", email: "u@test.com", password: "pass" });

    const result = await buyerLoginService("u@test.com", "pass");

    expect(result.success).toBe(true);
    expect(result.token).toBeTruthy();
  });

  test("getMyInfoService returns sanitized user for role=user", async () => {
    getBuyerById.mockResolvedValue({
      toObject: () => ({ _id: "u1", email: "u@test.com", password: "pass", wishlistProducts: ["p1"] }),
    });

    const result = await getMyInfoService("u1", "user");

    expect(result.success).toBe(true);
    expect(result.info.password).toBeUndefined();
    expect(result.info.wishlistProducts).toBeUndefined();
    expect(result.info.role).toBe("user");
  });

  test("getMyInfoService returns invalid role for unknown role", async () => {
    const result = await getMyInfoService("u1", "unknown");

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  test("adminLoginService returns 404 when admin missing", async () => {
    findAdminByEmail.mockResolvedValue(null);

    const result = await adminLoginService("admin@test.com", "pass");

    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });

  test("adminLoginService returns 401 for wrong password", async () => {
    findAdminByEmail.mockResolvedValue({ _id: "a1", password: "right" });

    const result = await adminLoginService("admin@test.com", "wrong");

    expect(result.success).toBe(false);
    expect(result.status).toBe(401);
  });

  test("adminLoginService returns token on success", async () => {
    findAdminByEmail.mockResolvedValue({
      _id: "a1",
      email: "admin@test.com",
      password: "pass",
    });

    const result = await adminLoginService("admin@test.com", "pass");

    expect(result.success).toBe(true);
    expect(result.token).toBeTruthy();
  });

  test("managerLoginService returns 404 when manager missing", async () => {
    findManagerByEmail.mockResolvedValue(null);

    const result = await managerLoginService("manager@test.com", "pass");

    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });

  test("managerLoginService returns token on success", async () => {
    findManagerByEmail.mockResolvedValue({
      _id: "m1",
      email: "manager@test.com",
      password: "pass",
      category: "Electronics",
    });

    const result = await managerLoginService("manager@test.com", "pass");

    expect(result.success).toBe(true);
    expect(result.token).toBeTruthy();
    expect(result.manager.category).toBe("Electronics");
  });

  test("verifyEmailService returns invalid otp for mismatched code", async () => {
    findPendingUserByEmail.mockResolvedValue({
      username: "u1",
      contact: "9999999999",
      email: "u@test.com",
      password: "pass",
      otp: "123456",
    });

    const result = await verifyEmailService("u@test.com", "000000");

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toBe("Invalid otp");
  });

  test("verifyEmailService creates user and deletes pending record when otp matches", async () => {
    findPendingUserByEmail.mockResolvedValue({
      username: "u1",
      contact: "9999999999",
      email: "u@test.com",
      password: "pass",
      otp: "123456",
    });
    createBuyer.mockResolvedValue({ _id: "u1", email: "u@test.com" });

    const result = await verifyEmailService("u@test.com", "123456");

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.token).toBeTruthy();
    expect(deletePendingUser).toHaveBeenCalledWith("u@test.com");
  });

  test("MailService throws when transporter send fails", async () => {
    nodemailer.createTransport.mockReturnValue({
      sendMail: jest.fn().mockRejectedValue(new Error("smtp down")),
    });

    await expect(MailService("u@test.com", "123456")).rejects.toThrow(
      "Failed to send verification email"
    );
  });

  test("MailService sends verification email successfully", async () => {
    const sendMail = jest.fn().mockResolvedValue(true);
    nodemailer.createTransport.mockReturnValue({ sendMail });

    await MailService("u@test.com", "123456");

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "u@test.com",
        text: expect.stringContaining("123456"),
      })
    );
  });
});
