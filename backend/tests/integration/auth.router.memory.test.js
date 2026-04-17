import mongoose from "mongoose";
import request from "supertest";

import Users from "../../src/models/Users.js";
import { connectMemoryDb, clearMemoryDb, disconnectMemoryDb } from "../helpers/mongoMemory.js";

describe("auth router (memory db)", () => {
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

  test("login then /me returns authenticated user info", async () => {
    await Users.create({
      username: "auth-user",
      contact: "9999999999",
      email: "auth-user@test.com",
      password: "pass123",
    });

    const agent = request.agent(app);

    const loginRes = await agent.post("/auth/login").send({
      email: "auth-user@test.com",
      password: "pass123",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);

    const meRes = await agent.get("/auth/me");

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.info.email).toBe("auth-user@test.com");
    expect(meRes.body.info.role).toBe("user");
  });

  test("/auth/me without token returns 403", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(403);
  });

  test("/auth/logout clears token cookie", async () => {
    const res = await request(app).delete("/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
