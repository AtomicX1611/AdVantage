import {
  addManager,
  getMetrics,
  takeDownUser,
} from "../../src/controllers/admin.controller.js";

import {
  addManagerService,
  getAdminMetricsService,
  removeUser,
} from "../../src/services/admin.service.js";

jest.mock("../../src/services/admin.service.js", () => ({
  findUsersForAdmin: jest.fn(),
  getProductsForAdmin: jest.fn(),
  removeUser: jest.fn(),
  removeManager: jest.fn(),
  addManagerService: jest.fn(),
  getAllDataService: jest.fn(),
  getAdminMetricsService: jest.fn(),
  getPaymentAnalyticsService: jest.fn(),
}));

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("admin.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("addManager returns 400 when required fields are missing", async () => {
    const req = { body: { email: "", password: "", category: "" } };
    const res = mockRes();

    await addManager(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("addManager returns 201 when service succeeds", async () => {
    const req = { body: { email: "m@test.com", password: "pass", category: "Electronics" } };
    const res = mockRes();

    addManagerService.mockResolvedValue({ success: true, message: "Manager created" });

    await addManager(req, res, jest.fn());

    expect(addManagerService).toHaveBeenCalledWith("m@test.com", "pass", "Electronics");
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("takeDownUser returns 401 when admin is unauthenticated", async () => {
    const req = { user: null, params: { userId: "u1" }, body: {} };
    const res = mockRes();

    await takeDownUser(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("takeDownUser returns 400 when user id missing", async () => {
    const req = { user: { _id: "a1" }, params: {}, body: {} };
    const res = mockRes();

    await takeDownUser(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("takeDownUser returns 200 when remove succeeds", async () => {
    const req = { user: { _id: "a1" }, params: { userId: "u1" }, body: {} };
    const res = mockRes();

    removeUser.mockResolvedValue({ success: true, message: "removed" });

    await takeDownUser(req, res, jest.fn());

    expect(removeUser).toHaveBeenCalledWith("u1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getMetrics returns 500 when service fails", async () => {
    const req = {};
    const res = mockRes();

    getAdminMetricsService.mockResolvedValue({ success: false, message: "failed" });

    await getMetrics(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("getMetrics returns metrics on success", async () => {
    const req = {};
    const res = mockRes();

    getAdminMetricsService.mockResolvedValue({
      success: true,
      metrics: { users: 10, products: 20 },
    });

    await getMetrics(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, metrics: { users: 10, products: 20 } })
    );
  });
});
