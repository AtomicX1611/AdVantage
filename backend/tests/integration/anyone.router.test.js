import express from "express";
import request from "supertest";
import anyoneRouter from "../../src/routes/anyone.router.js";
import { errorMiddleware } from "../../src/middlewares/error.middleware.js";

import {
  getFeaturedFreshProductsService,
  getProductDetailsService,
  getProductsService,
} from "../../src/services/anyone.service.js";

jest.mock("../../src/services/anyone.service.js", () => ({
  getFeaturedFreshProductsService: jest.fn(),
  getProductDetailsService: jest.fn(),
  getProductsService: jest.fn(),
}));

describe("anyone router integration", () => {
  const app = express();
  app.use(express.json());
  app.use("/anyone", anyoneRouter);
  app.use(errorMiddleware);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /anyone/HomeRequirements returns 200", async () => {
    getFeaturedFreshProductsService.mockResolvedValue({
      success: true,
      freshProducts: [{ _id: "n1" }],
      featuredProducts: [{ _id: "f1" }],
    });

    const res = await request(app).get("/anyone/HomeRequirements");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(true);
    expect(res.body.featuredProducts).toHaveLength(1);
  });

  test("GET /anyone/products/:id returns 404 when service fails", async () => {
    getProductDetailsService.mockResolvedValue({
      success: false,
      status: 404,
      message: "Product not found",
    });

    const res = await request(app).get("/anyone/products/p-missing");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("GET /anyone/products/filtered returns products", async () => {
    getProductsService.mockResolvedValue([{ _id: "p1" }, { _id: "p2" }]);

    const res = await request(app).get("/anyone/products/filtered?category=Mobiles");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.products).toHaveLength(2);
  });
});
