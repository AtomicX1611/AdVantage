import {
  fileComplaint,
  getMyComplaints,
  getProductBuyers,
  getProductComplaints,
} from "../../src/controllers/complaint.controller.js";

import {
  fileComplaintService,
  getMyComplaintsService,
  getProductBuyersService,
  getProductComplaintsService,
} from "../../src/services/complaint.service.js";

jest.mock("../../src/services/complaint.service.js", () => ({
  fileComplaintService: jest.fn(),
  getMyComplaintsService: jest.fn(),
  getProductComplaintsService: jest.fn(),
  getProductBuyersService: jest.fn(),
}));

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("complaint.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fileComplaint returns 400 when productId missing", async () => {
    const req = { user: { _id: "u1" }, body: { type: "product", subject: "s", description: "d" } };
    const res = mockRes();

    await fileComplaint(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("fileComplaint returns 400 when mandatory fields missing", async () => {
    const req = { user: { _id: "u1" }, body: { productId: "p1" } };
    const res = mockRes();

    await fileComplaint(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("fileComplaint returns 201 on success", async () => {
    const req = {
      user: { _id: "u1" },
      body: {
        productId: "p1",
        respondentId: "u2",
        type: "product",
        subject: "subject",
        description: "desc",
      },
    };
    const res = mockRes();

    fileComplaintService.mockResolvedValue({ success: true, complaint: { _id: "c1" } });

    await fileComplaint(req, res, jest.fn());

    expect(fileComplaintService).toHaveBeenCalledWith("u1", "p1", "u2", "product", "subject", "desc");
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("getMyComplaints returns service payload", async () => {
    const req = { user: { _id: "u1" } };
    const res = mockRes();

    getMyComplaintsService.mockResolvedValue({ success: true, complaints: [] });

    await getMyComplaints(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getProductComplaints validates productId", async () => {
    const req = { params: {} };
    const res = mockRes();

    await getProductComplaints(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("getProductBuyers returns non-success status from service", async () => {
    const req = { params: { productId: "p1" } };
    const res = mockRes();

    getProductBuyersService.mockResolvedValue({ success: false, status: 500, message: "error" });

    await getProductBuyers(req, res, jest.fn());

    expect(getProductBuyersService).toHaveBeenCalledWith("p1");
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
