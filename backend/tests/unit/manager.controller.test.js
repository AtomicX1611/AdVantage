import {
  dashboardController,
  resolveEscrowComplaintController,
  resolveComplaintController,
  verifyController,
} from "../../src/controllers/manager.controller.js";

import {
  fetchComplaintsByCategory,
  fetchUnverifiedProductsByCategory,
  resolveComplaintService,
  resolveEscrowComplaintService,
  verifyProduct,
} from "../../src/services/manager.service.js";

jest.mock("../../src/services/manager.service.js", () => ({
  verifyProduct: jest.fn(),
  fetchUnverifiedProducts: jest.fn(),
  fetchUnverifiedProductsByCategory: jest.fn(),
  fetchComplaintsByCategory: jest.fn(),
  resolveComplaintService: jest.fn(),
  resolveEscrowComplaintService: jest.fn(),
}));

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("manager.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("verifyController returns 400 when product id missing", async () => {
    const req = { body: {}, user: { _id: "m1", category: "Mobiles" } };
    const res = mockRes();

    await verifyController(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("verifyController returns 200 when verification succeeds", async () => {
    const req = { body: { pid: "p1" }, user: { _id: "m1", category: "Mobiles" } };
    const res = mockRes();

    verifyProduct.mockResolvedValue({ success: true, message: "verified" });

    await verifyController(req, res, jest.fn());

    expect(verifyProduct).toHaveBeenCalledWith("p1", "m1", "Mobiles");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("dashboardController returns 400 when manager category missing", async () => {
    const req = { user: {} };
    const res = mockRes();

    await dashboardController(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("dashboardController returns products for manager category", async () => {
    const req = { user: { category: "Electronics" } };
    const res = mockRes();

    fetchUnverifiedProductsByCategory.mockResolvedValue({
      success: true,
      products: [{ _id: "p1" }],
    });

    await dashboardController(req, res, jest.fn());

    expect(fetchUnverifiedProductsByCategory).toHaveBeenCalledWith("Electronics");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("resolveComplaintController validates complaint id and status", async () => {
    const req = { params: {}, body: {}, user: { _id: "m1", category: "Mobiles" } };
    const res = mockRes();

    await resolveComplaintController(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("resolveEscrowComplaintController maps legacy decision to actionType", async () => {
    const req = {
      params: { complaintId: "c1" },
      body: { decision: "Buyer_Win", resolution: "resolved" },
      user: { _id: "m1", category: "Mobiles" },
    };
    const res = mockRes();

    resolveEscrowComplaintService.mockResolvedValue({ success: true, status: 200, message: "ok" });

    await resolveEscrowComplaintController(req, res, jest.fn());

    expect(resolveEscrowComplaintService).toHaveBeenCalledWith(
      "c1",
      "m1",
      "Mobiles",
      expect.objectContaining({ actionType: "refund_buyer" })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("resolveEscrowComplaintController returns 400 when actionType missing", async () => {
    const req = {
      params: { complaintId: "c1" },
      body: {},
      user: { _id: "m1", category: "Mobiles" },
    };
    const res = mockRes();

    await resolveEscrowComplaintController(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
