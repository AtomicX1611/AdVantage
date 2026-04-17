import {
  buyerLoginService,
  getMyInfoService,
} from "../../src/services/auth.service.js";

import { findBuyerByEmail, getBuyerById, createBuyer } from "../../src/daos/users.dao.js";
import { findAdminByEmail, getAdminById } from "../../src/daos/admins.dao.js";
import { findManagerByEmail, getManagerById } from "../../src/daos/managers.dao.js";

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
});
