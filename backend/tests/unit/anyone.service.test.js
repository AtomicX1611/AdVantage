import {
  getFeaturedFreshProductsService,
  getProductDetailsService,
  getProductsService,
} from "../../src/services/anyone.service.js";

import {
  getFeaturedProductsDao,
  getFreshProductsDao,
  getProductById,
  findProducts,
  vectorSearchProducts,
} from "../../src/daos/products.dao.js";

import { generateSearchQueryEmbedding } from "../../src/helpers/productEmbedding.helper.js";

jest.mock("../../src/daos/products.dao.js", () => ({
  getFeaturedProductsDao: jest.fn(),
  getFreshProductsDao: jest.fn(),
  getProductById: jest.fn(),
  findProducts: jest.fn(),
  vectorSearchProducts: jest.fn(),
}));

jest.mock("../../src/helpers/productEmbedding.helper.js", () => ({
  generateSearchQueryEmbedding: jest.fn(),
}));

describe("anyone.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getFeaturedFreshProductsService returns featured and fresh products", async () => {
    getFeaturedProductsDao.mockResolvedValue([{ _id: "f1" }]);
    getFreshProductsDao.mockResolvedValue([{ _id: "n1" }]);

    const result = await getFeaturedFreshProductsService();

    expect(result).toEqual({
      success: true,
      featuredProducts: [{ _id: "f1" }],
      freshProducts: [{ _id: "n1" }],
    });
  });

  test("getProductDetailsService returns 404 when product missing", async () => {
    getProductById.mockResolvedValue(null);

    const result = await getProductDetailsService("missing");

    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });

  test("getProductsService uses vector search when name query is present", async () => {
    generateSearchQueryEmbedding.mockResolvedValue([0.1, 0.2]);
    vectorSearchProducts.mockResolvedValue([{ _id: "p1" }]);

    const result = await getProductsService({ name: "iphone", limit: "5", numCandidates: "15" });

    expect(generateSearchQueryEmbedding).toHaveBeenCalledWith("iphone");
    expect(vectorSearchProducts).toHaveBeenCalled();
    expect(result).toEqual([{ _id: "p1" }]);
  });

  test("getProductsService falls back to findProducts when no name query", async () => {
    findProducts.mockResolvedValue([{ _id: "p2" }]);

    const result = await getProductsService({ category: "Mobiles", verified: "true" });

    expect(findProducts).toHaveBeenCalled();
    expect(result).toEqual([{ _id: "p2" }]);
  });
});
