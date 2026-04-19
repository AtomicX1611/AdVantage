import {
  addManagerService,
  findUsersForAdmin,
  getAdminMetricsService,
  getAllDataService,
  getPaymentAnalyticsService,
  removeManager,
  removeUser,
} from "../../src/services/admin.service.js";

import {
  getBuyers,
  getAllAdmins,
  countAdmins,
  removeUserById,
} from "../../src/daos/admins.dao.js";
import {
  createManager,
  countManagers,
  findManagerByEmail,
  getAllManagers,
  getManagerVerifiedCounts,
  removeManagerById,
} from "../../src/daos/managers.dao.js";
import { countActiveUsers, countUsers, getAllUsers } from "../../src/daos/users.dao.js";
import {
  countAllProducts,
  countUnverifiedProducts,
  countVerifiedProducts,
  getAllProducts,
  getProductsByCategory,
} from "../../src/daos/products.dao.js";
import {
  countPayments,
  getAllPayments,
  getMonthlyRevenue,
  getPaymentStatsByType,
  getPaymentsWithProductDetails,
  getRecentPayments,
  getRevenueByCategory,
  getRevenueByPaymentType,
  getRevenueByState,
  getTopCategories,
  getTopStates,
} from "../../src/daos/payment.dao.js";

jest.mock("../../src/daos/admins.dao.js", () => ({
  getAdminById: jest.fn(),
  findAdminByEmail: jest.fn(),
  getAllAdmins: jest.fn(),
  countAdmins: jest.fn(),
  getBuyers: jest.fn(),
  getProducts: jest.fn(),
  removeUserById: jest.fn(),
}));

jest.mock("../../src/daos/managers.dao.js", () => ({
  getManagerById: jest.fn(),
  findManagerByEmail: jest.fn(),
  findManagerByCategory: jest.fn(),
  getAllManagers: jest.fn(),
  countManagers: jest.fn(),
  createManager: jest.fn(),
  removeManagerById: jest.fn(),
  getManagerVerifiedCounts: jest.fn(),
}));

jest.mock("../../src/daos/users.dao.js", () => ({
  getAllUsers: jest.fn(),
  countUsers: jest.fn(),
  countActiveUsers: jest.fn(),
}));

jest.mock("../../src/daos/products.dao.js", () => ({
  getAllProducts: jest.fn(),
  countAllProducts: jest.fn(),
  getProductsByCategory: jest.fn(),
  countVerifiedProducts: jest.fn(),
  countUnverifiedProducts: jest.fn(),
}));

jest.mock("../../src/daos/payment.dao.js", () => ({
  getAllPayments: jest.fn(),
  countPayments: jest.fn(),
  getPaymentStatsByType: jest.fn(),
  getRecentPayments: jest.fn(),
  getRevenueByCategory: jest.fn(),
  getRevenueByState: jest.fn(),
  getRevenueByPaymentType: jest.fn(),
  getMonthlyRevenue: jest.fn(),
  getPaymentsWithProductDetails: jest.fn(),
  getTopCategories: jest.fn(),
  getTopStates: jest.fn(),
}));

describe("admin.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("findUsersForAdmin returns DAO failure as-is", async () => {
    getBuyers.mockResolvedValue({ success: false, message: "No buyers" });

    const result = await findUsersForAdmin();

    expect(result.success).toBe(false);
    expect(result.message).toBe("No buyers");
  });

  test("findUsersForAdmin returns users on success", async () => {
    getBuyers.mockResolvedValue({ success: true, users: [{ _id: "u1" }] });

    const result = await findUsersForAdmin();

    expect(result.success).toBe(true);
    expect(result.users).toEqual([{ _id: "u1" }]);
  });

  test("removeUser validates required id", async () => {
    const result = await removeUser();

    expect(result.success).toBe(false);
    expect(result.message).toContain("userId is required");
  });

  test("removeUser returns success payload", async () => {
    removeUserById.mockResolvedValue({ success: true, user: { _id: "u1" } });

    const result = await removeUser("u1");

    expect(result.success).toBe(true);
    expect(result.message).toContain("removed successfully");
  });

  test("addManagerService validates required fields", async () => {
    const result = await addManagerService("", "", "");

    expect(result.success).toBe(false);
  });

  test("addManagerService blocks duplicate manager email", async () => {
    findManagerByEmail.mockResolvedValue({ _id: "m1" });

    const result = await addManagerService("m@test.com", "pass", "Electronics");

    expect(result.success).toBe(false);
    expect(result.message).toContain("already exists");
  });

  test("addManagerService creates manager", async () => {
    findManagerByEmail.mockResolvedValue(null);
    createManager.mockResolvedValue({ _id: "m2", email: "m2@test.com", category: "Mobiles" });

    const result = await addManagerService("m2@test.com", "pass", "Mobiles");

    expect(result.success).toBe(true);
    expect(result.manager).toEqual({ _id: "m2", email: "m2@test.com", category: "Mobiles" });
  });

  test("removeManager validates required id", async () => {
    const result = await removeManager();

    expect(result.success).toBe(false);
  });

  test("removeManager returns dao failure", async () => {
    removeManagerById.mockResolvedValue({ success: false, message: "not found" });

    const result = await removeManager("m1");

    expect(result.success).toBe(false);
    expect(result.message).toBe("not found");
  });

  test("getAllDataService maps data and counts", async () => {
    const fakeId = {
      toString: () => "507f1f77bcf86cd799439011",
      getTimestamp: () => new Date("2024-01-01T00:00:00.000Z"),
    };

    getAllAdmins.mockResolvedValue([{ _id: "a1" }]);
    getAllManagers.mockResolvedValue([{ _id: fakeId, email: "m@test.com", category: "Electronics" }]);
    getManagerVerifiedCounts.mockResolvedValue({ "507f1f77bcf86cd799439011": 4 });
    getAllUsers.mockResolvedValue([{ _id: "u1" }]);
    getAllProducts.mockResolvedValue([{ _id: "p1" }]);
    getAllPayments.mockResolvedValue([{ _id: "pay1" }]);
    countAdmins.mockResolvedValue(1);
    countManagers.mockResolvedValue(1);
    countUsers.mockResolvedValue(2);
    countAllProducts.mockResolvedValue(3);
    countPayments.mockResolvedValue(4);

    const result = await getAllDataService();

    expect(result.success).toBe(true);
    expect(result.data.managers[0].productsVerified).toBe(4);
    expect(result.counts.total).toBe(11);
  });

  test("getAdminMetricsService computes total revenue", async () => {
    getProductsByCategory.mockResolvedValue([{ _id: "Electronics", count: 3 }]);
    getPaymentStatsByType.mockResolvedValue([
      { _id: "purchase", totalAmount: 1000 },
      { _id: "subscription", totalAmount: 200 },
    ]);
    getRecentPayments.mockResolvedValue([
      { _id: "p1", from: { username: "u1" }, to: { username: "admin" }, paymentType: "purchase", price: 1000, date: new Date() },
    ]);
    countActiveUsers.mockResolvedValue(3);
    countUsers.mockResolvedValue(5);
    countVerifiedProducts.mockResolvedValue(2);
    countUnverifiedProducts.mockResolvedValue(1);
    countAllProducts.mockResolvedValue(3);
    countPayments.mockResolvedValue(8);

    const result = await getAdminMetricsService();

    expect(result.success).toBe(true);
    expect(result.metrics.totalRevenue).toBe(1200);
    expect(result.metrics.recentActivity).toHaveLength(1);
  });

  test("getPaymentAnalyticsService maps analytics structure", async () => {
    getRevenueByCategory.mockResolvedValue([{ _id: "Mobiles", totalRevenue: 5000, count: 2 }]);
    getRevenueByState.mockResolvedValue([{ _id: "Telangana", totalRevenue: 5000, count: 2 }]);
    getRevenueByPaymentType.mockResolvedValue([{ _id: "purchase", totalRevenue: 5000, count: 2 }]);
    getMonthlyRevenue.mockResolvedValue([{ _id: { year: 2026, month: 4 }, totalRevenue: 5000, count: 2 }]);
    getPaymentsWithProductDetails.mockResolvedValue([
      {
        _id: "pay1",
        fromUser: "buyer",
        toUser: "seller",
        price: 2500,
        paymentType: "purchase",
        date: new Date(),
        productName: "Phone",
        productCategory: "Mobiles",
        productState: "Telangana",
        productCity: "Hyderabad",
        productDistrict: "Hyderabad",
      },
    ]);
    getTopCategories.mockResolvedValue([{ _id: "Mobiles", salesCount: 2, totalRevenue: 5000, avgPrice: 2500 }]);
    getTopStates.mockResolvedValue([{ _id: "Telangana", salesCount: 2, totalRevenue: 5000 }]);

    const result = await getPaymentAnalyticsService();

    expect(result.success).toBe(true);
    expect(result.analytics.revenueByCategory[0]).toEqual(
      expect.objectContaining({ category: "Mobiles", revenue: 5000 })
    );
    expect(result.analytics.detailedPayments[0]).toEqual(
      expect.objectContaining({ product: "Phone", category: "Mobiles", state: "Telangana" })
    );
  });
});
