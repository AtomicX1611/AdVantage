import request from "supertest";
import jwt from "jsonwebtoken";

const buildCookie = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  return `token=${token}`;
};

describe("route RBAC integration", () => {
  let app;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
    process.env.RAZORPAYKEYID = process.env.RAZORPAYKEYID || "rzp_test_key";
    process.env.RAZORPAYKEYSECRET = process.env.RAZORPAYKEYSECRET || "rzp_test_secret";
    const { createApp } = await import("../../src/app.create.js");
    app = createApp();
  });

  test("GET /admin/metrics blocks user role", async () => {
    const cookie = buildCookie({ _id: "u1", role: "user" });

    const res = await request(app)
      .get("/admin/metrics")
      .set("Cookie", cookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("not authorized");
  });

  test("GET /manager/d blocks user role", async () => {
    const cookie = buildCookie({ _id: "u1", role: "user" });

    const res = await request(app)
      .get("/manager/d")
      .set("Cookie", cookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("not authorized");
  });

  test("GET /user/wishlist blocks admin role", async () => {
    const cookie = buildCookie({ _id: "a1", role: "admin" });

    const res = await request(app)
      .get("/user/wishlist")
      .set("Cookie", cookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("not authorized");
  });

  test("GET /admin/metrics requires token", async () => {
    const res = await request(app).get("/admin/metrics");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("token not provided");
  });

  test("GET /manager/d rejects invalid token", async () => {
    const res = await request(app)
      .get("/manager/d")
      .set("Cookie", "token=invalid.jwt.token");

    expect(res.status).toBe(403);
  });

  test("GET /auth/me requires token", async () => {
    const res = await request(app).get("/auth/me");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("token not provided");
  });
});
