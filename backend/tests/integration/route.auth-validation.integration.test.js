import request from "supertest";
import jwt from "jsonwebtoken";

describe("route auth and validation integration", () => {
  let app;

  const makeCookie = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    return `token=${token}`;
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
    process.env.RAZORPAYKEYID = process.env.RAZORPAYKEYID || "rzp_test_key";
    process.env.RAZORPAYKEYSECRET = process.env.RAZORPAYKEYSECRET || "rzp_test_secret";

    const { createApp } = await import("../../src/app.create.js");
    app = createApp();
  });

  test("GET /chat/contacts returns 403 when token missing", async () => {
    const res = await request(app).get("/chat/contacts");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("token not provided");
  });

  test("GET /chat/contacts returns 403 for invalid token", async () => {
    const res = await request(app)
      .get("/chat/contacts")
      .set("Cookie", "token=invalid.jwt.token");

    expect(res.status).toBe(403);
  });

  test("POST /chatbot/chat returns 400 for empty message", async () => {
    const res = await request(app).post("/chatbot/chat").send({ message: "   " });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /chatbot/chat/end returns 400 when thread_id missing", async () => {
    const res = await request(app).post("/chatbot/chat/end").send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /manager/complaints/:id/resolve-escrow returns 400 when actionType missing", async () => {
    const cookie = makeCookie({ _id: "m1", role: "manager", category: "Mobiles" });

    const res = await request(app)
      .post("/manager/complaints/c1/resolve-escrow")
      .set("Cookie", cookie)
      .send({ resolution: "done" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
