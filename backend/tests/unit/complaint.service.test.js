import {
  fileComplaintService,
  getMyComplaintsService,
  getProductBuyersService,
  getProductComplaintsService,
} from "../../src/services/complaint.service.js";

import {
  createComplaintDao,
  getBuyersForProductDao,
  getComplaintsByUserDao,
  getComplaintsForProductDao,
} from "../../src/daos/complaints.dao.js";
import { getProductById } from "../../src/daos/products.dao.js";
import { findManagerByCategory } from "../../src/daos/managers.dao.js";

jest.mock("../../src/daos/complaints.dao.js", () => ({
  createComplaintDao: jest.fn(),
  getComplaintByIdDao: jest.fn(),
  getComplaintsByCategoryDao: jest.fn(),
  getComplaintsByUserDao: jest.fn(),
  getComplaintsOnUserDao: jest.fn(),
  getComplaintsForProductDao: jest.fn(),
  getBuyersForProductDao: jest.fn(),
  resolveComplaintDao: jest.fn(),
}));

jest.mock("../../src/daos/products.dao.js", () => ({
  getProductById: jest.fn(),
}));

jest.mock("../../src/daos/managers.dao.js", () => ({
  findManagerByCategory: jest.fn(),
}));

describe("complaint.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fileComplaintService returns 404 when product does not exist", async () => {
    getProductById.mockResolvedValue(null);

    const result = await fileComplaintService("u1", "p1", "u2", "product", "subject", "desc");

    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });

  test("fileComplaintService blocks self complaint", async () => {
    getProductById.mockResolvedValue({ _id: "p1", category: "Electronics" });

    const result = await fileComplaintService("u1", "p1", "u1", "product", "subject", "desc");

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toContain("cannot file a complaint against yourself");
  });

  test("fileComplaintService creates complaint with assigned manager", async () => {
    getProductById.mockResolvedValue({ _id: "p1", category: "Electronics" });
    findManagerByCategory.mockResolvedValue({ _id: "m1" });
    createComplaintDao.mockResolvedValue({ _id: "c1" });

    const result = await fileComplaintService("u1", "p1", "u2", "product", "subject", "desc");

    expect(findManagerByCategory).toHaveBeenCalledWith("Electronics");
    expect(createComplaintDao).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "p1",
        complainant: "u1",
        respondent: "u2",
        assignedManager: "m1",
      })
    );
    expect(result.success).toBe(true);
  });

  test("fileComplaintService creates complaint without manager when category manager missing", async () => {
    getProductById.mockResolvedValue({ _id: "p1", category: "Unknown" });
    findManagerByCategory.mockResolvedValue(null);
    createComplaintDao.mockResolvedValue({ _id: "c2" });

    const result = await fileComplaintService("u1", "p1", null, "product", "subject", "desc");

    expect(createComplaintDao).toHaveBeenCalledWith(
      expect.objectContaining({
        assignedManager: null,
        respondent: null,
      })
    );
    expect(result.success).toBe(true);
  });

  test("getMyComplaintsService returns complaints", async () => {
    getComplaintsByUserDao.mockResolvedValue([{ _id: "c1" }]);

    const result = await getMyComplaintsService("u1");

    expect(result.success).toBe(true);
    expect(result.complaints).toEqual([{ _id: "c1" }]);
  });

  test("getProductComplaintsService handles dao error", async () => {
    getComplaintsForProductDao.mockRejectedValue(new Error("db down"));

    const result = await getProductComplaintsService("p1");

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
  });

  test("getProductBuyersService returns buyers list", async () => {
    getBuyersForProductDao.mockResolvedValue([{ _id: "u2" }]);

    const result = await getProductBuyersService("p1");

    expect(result.success).toBe(true);
    expect(result.buyers).toEqual([{ _id: "u2" }]);
  });
});
