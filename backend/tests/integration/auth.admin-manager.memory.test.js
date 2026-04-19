import request from "supertest";

import Admins from "../../src/models/Admins.js";
import Managers from "../../src/models/Managers.js";
import { connectMemoryDb, clearMemoryDb, disconnectMemoryDb } from "../helpers/mongoMemory.js";

describe("auth admin/manager login (memory db)", () => {
  let app;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
    process.env.RAZORPAYKEYID = process.env.RAZORPAYKEYID || "rzp_test_key";
    process.env.RAZORPAYKEYSECRET = process.env.RAZORPAYKEYSECRET || "rzp_test_secret";

    await connectMemoryDb();
    const { createApp } = await import("../../src/app.create.js");
    app = createApp();
  });

  beforeEach(async () => {
    await clearMemoryDb();
  });

  afterAll(async () => {
    await disconnectMemoryDb();
  });

  test("POST /auth/admin/login returns 400 when fields missing", async () => {
    const res = await request(app).post("/auth/admin/login").send({ email: "admin@test.com" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /auth/admin/login succeeds for valid admin", async () => {
    await Admins.create({ email: "admin@test.com", password: "pass123" });

    const res = await request(app).post("/auth/admin/login").send({
      email: "admin@test.com",
      password: "pass123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("POST /auth/manager/login returns 401 for wrong password", async () => {
    await Managers.create({
      email: "manager@test.com",
      password: "pass123",
      category: "Electronics",
    });

    const res = await request(app).post("/auth/manager/login").send({
      email: "manager@test.com",
      password: "wrong",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /auth/manager/login succeeds for valid manager", async () => {
    await Managers.create({
      email: "manager@test.com",
      password: "pass123",
      category: "Electronics",
    });

    const res = await request(app).post("/auth/manager/login").send({
      email: "manager@test.com",
      password: "pass123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.category).toBe("Electronics");
    expect(res.headers["set-cookie"]).toBeDefined();
  });
});
